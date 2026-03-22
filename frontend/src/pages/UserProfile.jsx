import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../utils/userApi";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getMe();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    if (!profile) fetchProfile();
  }, [profile]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default UserProfile;
