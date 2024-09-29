import React, { createContext, useContext, useState, useEffect } from "react";
import { useToken } from "./TokenProvider";

interface OAuthContextType {
    authCode: string | null;
    initiateOAuth: () => Promise<void>;
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined);

export const OAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authCode, setAuthCode] = useState<string | null>(null);
    const { privateToken, fetchPrivateToken } = useToken();

    const initiateOAuth = async () => {
        try {
            const response = await fetch("/api/hootsuite/openOauth");
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const redirectLink = await response.json();
            const oauthWindow = window.open(redirectLink.url, '_blank', 'width=500,height=700');
    
            if (!oauthWindow) {
                console.error("Popup blocked. Unable to open OAuth window.");
                return;
            }
    
            const messageListener = async (event: MessageEvent) => {
                window.removeEventListener("message", messageListener);
                if (event.origin === window.location.origin && event.data?.authCode) {
                    setAuthCode(event.data.authCode);
                    console.log("Received auth code:", event.data.authCode);
    
                    // Fetch the private token using the authCode
                    await fetchPrivateToken(event.data.authCode);
    
                    // Clean up by removing the event listener once the message is received
                }
            };
    
            // Add the event listener
            window.addEventListener("message", messageListener);
        } catch (error) {
            console.error("Error during OAuth call:", error);
        }
    };
    

    return (
        <OAuthContext.Provider value={{ authCode, initiateOAuth }}>
            {children}
        </OAuthContext.Provider>
    );
};

export const useOAuth = () => {
    const context = useContext(OAuthContext);
    if (!context) {
        throw new Error("useOAuth must be used within an OAuthProvider");
    }
    return context;
};
