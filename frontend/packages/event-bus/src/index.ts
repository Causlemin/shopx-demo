import * as signalR from "@microsoft/signalr";
import type { CartItem } from "@repo/types";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:5000";

const CART_HUB_URL = `${API_GATEWAY_URL}/hubs/cart`;

let connection: signalR.HubConnection | null = null;

export async function startCartConnection() {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(CART_HUB_URL, {
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .build();

  await connection.start();

  return connection;
}

export async function emitCartAdd(item: CartItem) {
  const conn = await startCartConnection();

  await conn.invoke("AddToCart", item);
}

export async function subscribeCartAdd(callback: (item: CartItem) => void) {
  const conn = await startCartConnection();

  conn.off("CartItemAdded");
  conn.on("CartItemAdded", callback);

  return () => {
    conn.off("CartItemAdded", callback);
  };
};

export async function emitCartSync(items: CartItem[]) {
  const conn = await startCartConnection();

  await conn.invoke("SyncCart", items);
}

export async function subscribeCartSync(callback: (items: CartItem[]) => void) {
  const conn = await startCartConnection();

  conn.off("CartSynced");
  conn.on("CartSynced", callback);

  return () => {
    conn.off("CartSynced", callback);
  };
}

const ORDER_COMPLETED_EVENT = "OrderCompleted";

export async function emitOrderCompleted() {
  const conn = await startCartConnection();
  await conn.invoke("OrderCompleted");
}

export async function subscribeOrderCompleted(callback: () => void) {
  const conn = await startCartConnection();

  conn.off(ORDER_COMPLETED_EVENT);
  conn.on(ORDER_COMPLETED_EVENT, callback);

  return () => {
    conn.off(ORDER_COMPLETED_EVENT, callback);
  };
}