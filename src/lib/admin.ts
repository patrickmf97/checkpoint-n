import {cookies} from "next/headers";import crypto from "crypto";
const COOKIE="checkpoint_admin";
function secret(){return process.env.ADMIN_SECRET||""}
export async function isAdmin(){const c=await cookies();const token=c.get(COOKIE)?.value;if(!token||!secret())return false;const expected=crypto.createHmac("sha256",secret()).update("checkpoint-n-admin").digest("hex");try{return crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected))}catch{return false}}
export async function setAdmin(){const c=await cookies();const token=crypto.createHmac("sha256",secret()).update("checkpoint-n-admin").digest("hex");c.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*12})}
export async function clearAdmin(){const c=await cookies();c.delete(COOKIE)}
