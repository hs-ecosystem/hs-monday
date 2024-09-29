import React, { createContext, useContext, useState, useEffect } from "react";

interface TokenContextType {
  privateToken: string | null;
  publicToken: string | null;
  fetchPublicToken: () => Promise<string | null>;
  fetchPrivateToken: (authCode: string) => Promise<void>;
  refreshPrivateToken: () => Promise<void>; // New function to refresh the private token
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicToken, setPubToken] = useState<string | null>(null);
  const [privateToken, setPrivToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null); // Store refresh token
  const [pubExpiration, setPubExpiration] = useState<number | null>(null);
  const [privateExpiration, setPrivExpiration] = useState<number | null>(null);

  const fetchPublicToken = async (): Promise<string | null> => {
    if (!publicToken || (pubExpiration && Date.now() > pubExpiration)) {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
  
        if (data.access_token && data.expires_in) {
          setPubToken(data.access_token);
          setPubExpiration(Date.now() + data.expires_in * 1000); // Store expiration time
          console.log("Public token received:", data.access_token);
          return data.access_token;
        } else {
          console.error("No public token or expiration time received", data);
          return null;
        }
      } catch (error) {
        console.error("Error fetching public auth token:", error);
        return null;
      }
    }
    return publicToken; // Return current token if still valid
  };
  

  const fetchPrivateToken = async (authCode: string) => {
    if (privateExpiration && Date.now() > privateExpiration) {
      console.log("Private token expired, refreshing token.");
      return refreshPrivateToken();
    }
    if (!privateToken) {
      try {
        const response = await fetch(`/api/hootsuite/token?authCode=${encodeURIComponent(authCode)}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        });

        const data = await response.json();

        if (data.access_token && data.expires_in) {
          setPrivToken(data.access_token);
          setPrivExpiration(Date.now() + data.expires_in * 1000); // Store expiration time
          setRefreshToken(data.refresh_token); // Store the refresh token
          console.log("Private token and refresh token received and set:", data.access_token);
          return data.access_token;
        } else {
          console.error("No private token or expiration time received", data);
        }
      } catch (error) {
        console.error("Error fetching private auth token:", error);
      }
    }
    return privateToken;
  };

  // Refresh the private token using the refresh token
  const refreshPrivateToken = async () => {
    if (refreshToken && privateExpiration && Date.now() > privateExpiration) {
      try {
        const response = await fetch(`/api/hootsuite/tokenRefresh?token=${encodeURIComponent(refreshToken)}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        });
  
        const data = await response.json();
  
        if (data.access_token && data.expires_in) {
          setPrivToken(data.access_token);
          setPrivExpiration(Date.now() + data.expires_in * 1000); // Update expiration time
          setRefreshToken(data.refresh_token); // Update the refresh token, if provided
          console.log("Private token refreshed:", data.access_token);
          return data.access_token;
        } else {
          console.error("No refreshed private token or expiration time received", data);
        }
      } catch (error) {
        console.error("Error refreshing private auth token:", error);
      }
    } else {
      console.error("No refresh token available or token still valid");
    }
  };
  
  return (
    <TokenContext.Provider value={{ publicToken, privateToken, fetchPrivateToken, fetchPublicToken, refreshPrivateToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};
