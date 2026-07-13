import type { Metadata } from "next";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Creators deserve to know, not guess. Viralyz is a Digiteq company building the scored creator network.",
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">About</span>
          <h1>Creators deserve to know, not guess.</h1>
          <p>
            Viralyz exists because posting content should not feel like a
            lottery ticket.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap about-body">
          <p>
            Millions of people make content every day. Most of them post it and
            hope. A video that took two days to make can fail because of a weak
            first three seconds, a thumbnail nobody can read, or a posting time
            when the audience was asleep. These problems are fixable. Creators
            just could not see them.
          </p>
          <p>
            <b>Viralyz makes them visible.</b> We score content before it goes
            live, explain what is wrong in plain language, and show what each
            fix is worth. Then we track what really happened, tell you honestly
            how accurate we were, and get better with every post.
          </p>
          <p>
            Over time, those scores become something bigger: a track record. A
            creator with a year of verified scores has proof that no follower
            count can match. That is why brands are coming too. They would
            rather hire proof than promises.
          </p>
          <p>
            We believe in a few simple things. Show your accuracy, never hide
            it. Help creators make their own version of what works, never
            copies. And follow the platform rules, because a banned account
            helps nobody.
          </p>

          <div className="digiteq-card">
            <div className="digiteq-mark">D</div>
            <div>
              <h4>Viralyz is a Digiteq company</h4>
              <p>
                Digiteq Holdings Limited is a UK company that builds and grows
                digital products. Viralyz is built and operated by Digiteq from
                Windsor, England. Sister products include BMKRS,
                FreelanceNearMe, Konduit and three18media.
              </p>
            </div>
          </div>

          <div className="values">
            <div className="value">
              <h4>Honest numbers</h4>
              <p>
                We publish our prediction accuracy on every profile. If we are
                wrong, you will see it.
              </p>
            </div>
            <div className="value">
              <h4>Your work, your data</h4>
              <p>
                Export or delete everything, any time. Brands only ever see what
                you choose to share.
              </p>
            </div>
            <div className="value">
              <h4>By the rules</h4>
              <p>
                Every integration uses official platform channels. We will never
                put your account at risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FinalCta
        title="Come and see your first score."
        subtitle="It takes less than a minute, and it might change how you post forever."
        cta="Start free"
      />
    </MarketingShell>
  );
}
