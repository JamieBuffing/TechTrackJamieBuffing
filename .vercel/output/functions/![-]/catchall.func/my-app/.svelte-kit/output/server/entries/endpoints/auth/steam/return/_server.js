import { redirect } from "@sveltejs/kit";
async function GET(event) {
  const { url } = event;
  const claimedId = url.searchParams.get("openid.claimed_id");
  if (!claimedId) {
    throw redirect(302, "/?login=failed");
  }
  const match = claimedId.match(/\/id\/(\d+)$/);
  const steamId = match ? match[1] : null;
  if (!steamId) {
    throw redirect(302, "/?login=failed");
  }
  const redirectTo = `${url.origin}/?steamid=${steamId}`;
  throw redirect(302, redirectTo);
}
export {
  GET
};
