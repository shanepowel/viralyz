// PayPal Integration - using javascript_paypal blueprint
import { Request, Response } from "express";
import { storage } from "./storage";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

let ordersController: any = null;
let oAuthAuthorizationController: any = null;
let paypalEnabled = false;

const PLAN_PRICING: Record<string, { amount: string; credits: number }> = {
  pro: { amount: "29.00", credits: -1 },
  team: { amount: "99.00", credits: -1 },
};

const pendingOrders: Map<string, { planId: string; userId: string }> = new Map();

async function initPayPal() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.warn("PayPal credentials not configured - payments disabled");
    return false;
  }
  
  try {
    const sdk = await import("@paypal/paypal-server-sdk");
    const { Client, Environment, LogLevel, OAuthAuthorizationController, OrdersController } = sdk;
    
    const client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      timeout: 0,
      environment:
                    process.env.NODE_ENV === "production"
                      ? Environment.Production
                      : Environment.Sandbox,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: {
          logBody: true,
        },
        logResponse: {
          logHeaders: true,
        },
      },
    });
    ordersController = new OrdersController(client);
    oAuthAuthorizationController = new OAuthAuthorizationController(client);
    paypalEnabled = true;
    console.log("PayPal initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize PayPal:", error);
    return false;
  }
}

// Initialize on module load
initPayPal();

/* Token generation helpers */

export async function getClientToken() {
  if (!oAuthAuthorizationController || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal not configured");
  }
  
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal payments not configured. Please add your PayPal credentials." });
  }
  
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { planId } = req.body;

    if (!planId || !PLAN_PRICING[planId]) {
      return res.status(400).json({ error: "Invalid plan. Please select a valid subscription plan." });
    }

    const plan = PLAN_PRICING[planId];

    const collect = {
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: plan.amount,
            },
            description: `Viralyz ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } = await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    if (jsonResponse.id) {
      pendingOrders.set(jsonResponse.id, { planId, userId: user.id });
    }

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal payments not configured" });
  }
  
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { orderID } = req.params;
    
    const orderInfo = pendingOrders.get(orderID);
    if (orderInfo && orderInfo.userId !== user.id) {
      return res.status(403).json({ error: "Order does not belong to this user" });
    }

    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } = await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    if (jsonResponse.status === "COMPLETED") {
      if (orderInfo) {
        const { planId, userId } = orderInfo;
        const credits = planId === "pro" || planId === "team" ? -1 : 10;
        
        await storage.updateUserPlan(userId, planId, credits);
        pendingOrders.delete(orderID);
        
        console.log(`User ${userId} upgraded to ${planId} plan`);
        
        res.status(httpStatusCode).json({
          ...jsonResponse,
          planUpgrade: {
            success: true,
            plan: planId,
            message: `Successfully upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`
          }
        });
        return;
      }
    }

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    const clientToken = await getClientToken();
    res.json({
      clientToken,
    });
  } catch (error) {
    console.error("Failed to get PayPal client token:", error);
    res.status(503).json({ error: "PayPal not configured" });
  }
}

export function isPaypalEnabled() {
  return paypalEnabled;
}
