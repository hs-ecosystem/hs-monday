import React, { useEffect, useRef, useState } from 'react';
import { useOAuth } from '../services/OauthProvider';  
import { useToken } from '../services/TokenProvider';
// import { useNavigate } from 'react-router-dom';
import { HootsuiteUser } from '../types/User'; // Adjust the path as necessary
import { Hootsuite } from '../services/Hootsuite';
// import { FaUser } from 'react-icons/fa';
import { Loading } from '../components/Loading';

const Profile: React.FC = () => {
  const { authCode, initiateOAuth } = useOAuth();  
  const { privateToken } = useToken();
  const oauthCalled = useRef(false);
  const [userData, setUserData] = useState<HootsuiteUser | null>(null); // Use User type
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    const processPrivateToken = async () => {
      try {
        if (!authCode && !oauthCalled.current) {
          oauthCalled.current = true;
          await initiateOAuth();  // Call initiateOAuth from OAuthProvider
        }
      } catch (error) {
        console.error("Error during private token process:", error);
      }
    };
    if(!authCode){
      processPrivateToken();
    } else {

    }
  }, [authCode, initiateOAuth]);

  // Fetch user data if privateToken is available
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {

        const response = await fetch(`/api/hootsuite/me?token=${privateToken}`);
        const data = await response.json();

        setUserData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (privateToken) {
      console.log("Private token ready:", privateToken); // Debug log
      fetchUserData();
    }
  }, [privateToken]);

  return (
    <div className="container mx-auto">
      {authCode ? (
        <div>
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {userData ? (
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm text-center">
            <div className="bg-gray-100 rounded-full p-2 mb-4">
              <img
                src={`https://robohash.org/${userData.id}?set=set3`} // Placeholder avatar
                alt={userData.fullName}
                className="w-24 h-24 rounded-full mx-auto border"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">{userData.fullName}</h2>
            <p className="text-gray-600 mb-4">{userData.bio}</p>
            <div className="text-left">
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Company:</strong> {userData.companyName}</p>
              <p><strong>Created Date:</strong> {new Date(userData.createdDate).toLocaleDateString()}</p>
              <p><strong>Modified Date:</strong> {new Date(userData.modifiedDate).toLocaleDateString()}</p>
              <p><strong>Timezone:</strong> {userData.timezone}</p>
              <p><strong>Language:</strong> {userData.language}</p>
              <p><strong>Active:</strong> {userData.isActive ? 'Yes' : 'No'}</p>
            </div>
          </div>
        ) : (
          <p>No user data available.</p>
        )}
      </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default Profile;
