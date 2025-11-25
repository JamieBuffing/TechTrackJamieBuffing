import { redirect } from "@sveltejs/kit";
async function GET(event) {
  const origin = event.url.origin;
  const returnTo = `${origin}/auth/steam/return`;
  const realm = origin;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });
  const steamOpenIdUrl = "https://steamcommunity.com/openid/login?" + params.toString();
  throw redirect(302, steamOpenIdUrl);
}
export {
  GET
};
