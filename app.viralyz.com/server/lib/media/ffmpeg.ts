import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export interface MediaProbe {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  hasVideo: boolean;
  hasAudio: boolean;
  format: string | null;
}

export interface ExtractedFrame {
  index: number;
  atSeconds: number;
  /** Absolute disk path to JPEG */
  path: string;
  /** Base64 data URL for vision models */
  dataUrl: string;
}

function run(
  cmd: string,
  args: string[],
): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stderr }));
  });
}

/** Probe media with ffprobe */
export async function probeMedia(inputPath: string): Promise<MediaProbe> {
  const { code, stderr } = await run("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    inputPath,
  ]);

  if (code !== 0) {
    // Fallback: try reading duration from ffmpeg
    return {
      durationSeconds: null,
      width: null,
      height: null,
      hasVideo: true,
      hasAudio: false,
      format: null,
    };
  }

  try {
    // ffprobe writes JSON to stdout — re-run capturing stdout
    const json = await new Promise<string>((resolve, reject) => {
      const child = spawn("ffprobe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        inputPath,
      ]);
      let out = "";
      child.stdout.on("data", (d) => {
        out += d.toString();
      });
      child.on("error", reject);
      child.on("close", (c) =>
        c === 0 ? resolve(out) : reject(new Error(stderr || "ffprobe failed")),
      );
    });

    const data = JSON.parse(json) as {
      format?: { duration?: string; format_name?: string };
      streams?: Array<{
        codec_type?: string;
        width?: number;
        height?: number;
      }>;
    };

    const video = data.streams?.find((s) => s.codec_type === "video");
    const audio = data.streams?.find((s) => s.codec_type === "audio");
    const duration = data.format?.duration
      ? parseFloat(data.format.duration)
      : null;

    return {
      durationSeconds: duration && Number.isFinite(duration) ? duration : null,
      width: video?.width ?? null,
      height: video?.height ?? null,
      hasVideo: !!video,
      hasAudio: !!audio,
      format: data.format?.format_name ?? null,
    };
  } catch {
    return {
      durationSeconds: null,
      width: null,
      height: null,
      hasVideo: true,
      hasAudio: false,
      format: null,
    };
  }
}

/**
 * Extract frames at ~1fps (capped) from a video file.
 * Returns JPEG frames as data URLs for vision scoring.
 */
export async function extractFrames(
  inputPath: string,
  opts?: { fps?: number; maxFrames?: number },
): Promise<{ frames: ExtractedFrame[]; workDir: string }> {
  const fps = opts?.fps ?? 1;
  const maxFrames = opts?.maxFrames ?? 24;
  const workDir = join(tmpdir(), `vy-frames-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });

  const pattern = join(workDir, "frame-%04d.jpg");
  const { code, stderr } = await run("ffmpeg", [
    "-i",
    inputPath,
    "-vf",
    `fps=${fps}`,
    "-frames:v",
    String(maxFrames),
    "-q:v",
    "4",
    "-y",
    pattern,
  ]);

  if (code !== 0) {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    throw new Error(`ffmpeg frame extract failed: ${stderr.slice(-400)}`);
  }

  const files = (await readdir(workDir))
    .filter((f) => f.endsWith(".jpg"))
    .sort();

  const frames: ExtractedFrame[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const path = join(workDir, file);
    const buf = await readFile(path);
    frames.push({
      index: i,
      atSeconds: i / fps,
      path,
      dataUrl: `data:image/jpeg;base64,${buf.toString("base64")}`,
    });
  }

  return { frames, workDir };
}

/** Write a buffer to a temp file and return its path */
export async function writeTempMedia(
  buffer: Buffer,
  ext = ".mp4",
): Promise<string> {
  const path = join(tmpdir(), `vy-media-${randomUUID()}${ext}`);
  await writeFile(path, buffer);
  return path;
}

export async function cleanupDir(dir: string | null | undefined) {
  if (!dir) return;
  await rm(dir, { recursive: true, force: true }).catch(() => {});
}

export async function cleanupFile(path: string | null | undefined) {
  if (!path) return;
  await rm(path, { force: true }).catch(() => {});
}

/** Extract audio track as WAV for transcription */
export async function extractAudioWav(inputPath: string): Promise<Buffer> {
  const outputPath = join(tmpdir(), `vy-audio-${randomUUID()}.wav`);
  try {
    const { code, stderr } = await run("ffmpeg", [
      "-i",
      inputPath,
      "-vn",
      "-f",
      "wav",
      "-ar",
      "16000",
      "-ac",
      "1",
      "-acodec",
      "pcm_s16le",
      "-y",
      outputPath,
    ]);
    if (code !== 0) {
      throw new Error(`ffmpeg audio extract failed: ${stderr.slice(-300)}`);
    }
    return await readFile(outputPath);
  } finally {
    await cleanupFile(outputPath);
  }
}
