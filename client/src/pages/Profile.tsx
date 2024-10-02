import React, { useEffect, useRef, useState } from 'react';
import { useOAuth } from '../services/OauthProvider';
import { useToken } from '../services/TokenProvider';
import { HootsuiteUser } from '../types/User'; // Adjust the path as necessary
import { Loading } from '../components/Loading';
import { FaTwitter, FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin, FaYoutube, FaTiktok, FaPinterest } from 'react-icons/fa'; // Import social icons

interface SocialProfile {
  id: string;
  type: string;
  socialNetworkId: string;
  socialNetworkUsername: string;
  avatarUrl: string | null;
  owner: string;
  ownerId: string;
  isReauthRequired: number;
}

const Profile: React.FC = () => {
  const { authCode, initiateOAuth } = useOAuth();
  const { privateToken } = useToken();
  const oauthCalled = useRef(false);
  const [userData, setUserData] = useState<HootsuiteUser | null>(null);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const processPrivateToken = async () => {
      try {
        if (!authCode && !oauthCalled.current) {
          oauthCalled.current = true;
          await initiateOAuth(); // Call initiateOAuth from OAuthProvider
        }
      } catch (error) {
        console.error('Error during private token process:', error);
      }
    };
    if (!authCode) {
      processPrivateToken();
    }
  }, [authCode, initiateOAuth]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const profileResponse = await fetch(`/api/hootsuite/me?token=${privateToken}`);
        const profileData = await profileResponse.json();
        setUserData(profileData.data);

        const socialResponse = await fetch(`/api/hootsuite/socialProfiles?token=${privateToken}`);
        const socialData = await socialResponse.json();
        const remappedSocialProfiles = socialData.profiles.map((profile: any) => profile.data);
        setSocialProfiles(remappedSocialProfiles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (privateToken) {
      fetchUserData();
    }
  }, [privateToken]);

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'TWITTER':
        return <FaTwitter className="text-blue-500 w-16 h-16" />;
      case 'FACEBOOK':
      case 'FACEBOOKPAGE':
        return <FaFacebook className="text-blue-700 w-16 h-16" />;
      case 'INSTAGRAM':
      case 'INSTAGRAMBUSINESS':
        return <FaInstagram className="text-pink-500 w-16 h-16" />;
      case 'WHATSAPP':
        return <FaWhatsapp className="text-green-500 w-16 h-16" />;
      case 'LINKEDIN':
      case 'LINKEDINCOMPANY':
        return <FaLinkedin className="text-blue-600 w-16 h-16" />;
      case 'YOUTUBECHANNEL':
        return <FaYoutube className="text-red-600 w-16 h-16" />;
      case 'TIKTOKBUSINESS':
        return <FaTiktok className="text-black w-16 h-16" />;
      case 'THREADS':
        return <FaTiktok className="text-black w-16 h-16" />;
      case 'PINTEREST':
        return <FaPinterest className="text-red-600 w-16 h-16" />;
      default:
        return null;
    }
  };

  const handleProfileSelect = (id: string) => {
    setSelectedProfiles((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((profileId) => profileId !== id)
        : [...prevSelected, id]
    );
  };

  const formatProfileType = (type: string) => {
    const formattedType = type.replace(/([A-Z])/g, ' $1').trim();
    return formattedType.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSelectAll = () => {
    const allProfileIds = socialProfiles.map((profile) => profile.id);
    setSelectedProfiles(allProfileIds);
  };

  const handleClearAll = () => {
    setSelectedProfiles([]);
  };

  return (
    <div className="container mx-auto">
      {authCode ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          {loading ? (
            <Loading />
          ) : userData ? (
            <div>
              <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm text-center">
                <h2 className="text-xl font-semibold mb-2">{userData.fullName}</h2>
                <p className="text-gray-600 mb-4">{userData.bio}</p>
                <div className="text-left">
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Company:</strong> {userData.companyName}</p>
                </div>
              </div>

              {/* Select All / Clear All buttons */}
              <div className="mt-4 mb-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>

              {/* Render social profiles */}
              <h2 className="text-2xl font-bold mt-6 mb-4">Social Profiles</h2>
              <div className="flex flex-wrap gap-4">
                {socialProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-center border rounded-lg p-4 w-full md:w-1/3 lg:w-1/4 cursor-pointer ${
                      selectedProfiles.includes(profile.id) ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    onClick={() => handleProfileSelect(profile.id)}
                  >
                    <input
                      type="checkbox"
                      className="mr-4"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={() => handleProfileSelect(profile.id)}
                    />
                    <div className="flex-shrink-0">
                      {getSocialIcon(profile.type)}
                      {profile.avatarUrl && (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.socialNetworkUsername}
                          className="absolute w-10 h-10 rounded-full -mt-8"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex flex-col">
                      <h3 className="text-lg font-semibold">{profile.socialNetworkUsername}</h3>
                      <p className="text-gray-500">{formatProfileType(profile.type)}</p>

                      {profile.isReauthRequired ? (
                        <p className="text-red-300">Re-authentication required</p>
                      ) : (
                        <p className="text-green-300">Active</p>
                      )}
                    </div>
                  </div>
                ))}
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
