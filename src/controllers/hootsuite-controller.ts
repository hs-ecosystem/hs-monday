import { Request, Response } from 'express';
import querystring from 'querystring';

export async function callback(req: Request, res: Response) {
  const authorizationCode = req.query.code as string;

  // Redirect the user back to the home page with the authorization code
  res.redirect(`/quit?auth=${authorizationCode}`);
};

export async function getSocials(req: Request, res: Response) {
  const { token } = req.query;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Step 1: Fetch the list of social profiles
    const response = await fetch('https://platform.hootsuite.com/v1/socialProfiles', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${token}`, // Pass the token received in the request
      },
    });

    const data = await response.json();
    const socialProfiles = data.data; // Assuming data.data is the list of profiles

    if (socialProfiles){
      // Step 2: Fetch detailed info for each social profile by id
      const detailedProfiles = await Promise.all(
        socialProfiles.map(async (profile: { id: string; }) => {
          const detailResponse = await fetch(`https://platform.hootsuite.com/v1/socialProfiles/${profile.id}`, {
            method: 'GET',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              authorization: `Bearer ${token}`,
            },
          });
          const profileDetail = await detailResponse.json();
          return profileDetail;
        })
      );

      // Step 3: Return the detailed profiles data as a response
      res.json({ profiles: detailedProfiles });
    }
    res.status(500).json({ error: 'Failed to fetch social profiles' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}

export async function getUser(req: Request, res: Response) {
  const { token } = req.query;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const response = await fetch('https://platform.hootsuite.com/v1/me', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        "content-type": 'application/json',
        authorization: `Bearer ${token}` // Pass the token received in the request
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}

export async function getToken(req: Request, res: Response) {
  const { authCode } = req.query;
  const clientId = process.env.HOOTSUITE_CLIENT_ID || '';
  const clientSecret = process.env.HOOTSUITE_CLIENT_SECRET || '';
  const redirectUri = process.env.HOOTSUITE_REDIRECT || '';
  const scope = 'offline';

  console.log("Authorization Code:", authCode);

  const tokenUrl = 'https://platform.hootsuite.com/oauth2/token';

  try {
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        accept: "application/json",
        authorization: `Basic ${encoded}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authCode as string,
        redirect_uri: redirectUri,
        scope: scope,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Response Data:", data);
      throw new Error(`Failed to get token. Status: ${response.status}`);
    }

    const data = await response.json();
    return res.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      scope: data.scope,
    });
  } catch (err) {
    console.error('Error during OAuth token process:', err);
    return res.status(500).send({ message: 'Internal server error' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { token } = req.query;
  const clientId = process.env.HOOTSUITE_CLIENT_ID || '';
  const clientSecret = process.env.HOOTSUITE_CLIENT_SECRET || '';
  const scope = 'offline';
  const tokenUrl = 'https://platform.hootsuite.com/oauth2/token';

  console.log("Refresh Token:", token);

  try {
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encoded}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token as string,
        scope: scope,
      }).toString(),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Response Data:", data);
      throw new Error(`Failed to refresh token. Status: ${response.status}`);
    }

    const data = await response.json();
    return res.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      scope: data.scope,
    });
  } catch (err) {
    console.error('Error during OAuth token refresh process:', err);
    return res.status(500).send({ message: 'Internal server error' });
  }
}


export async function getOauth(req: Request, res: Response) {
  const clientId = process.env.HOOTSUITE_CLIENT_ID || ''; // Store client ID in an environment variable
  const redirectUri = 'http://localhost:3000/api/hootsuite/callback';
  const scope = 'offline';

  // Construct the authorize URL with query parameters
  const authorizeUrl = `https://platform.hootsuite.com/oauth2/auth?${querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
  })}`;

  try {
    res.json({ url: authorizeUrl });

  } catch (err) {
    console.error('Error during OAuth process:', err);
    return res.status(500).send({ message: 'Internal server error' });
  }
}
