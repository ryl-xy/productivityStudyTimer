import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji avatar
  subjects: Subject[];
  createdAt: number;
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  addProfile: (name: string, avatar: string) => Promise<Profile>;
  updateProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  addSubjectToProfile: (profileId: string, subject: Subject) => Promise<void>;
  removeSubjectFromProfile: (profileId: string, subjectId: string) => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  PROFILES: 'profiles_data',
  ACTIVE_PROFILE_ID: 'active_profile_id',
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesRaw, activeIdRaw] = await AsyncStorage.multiGet([
        STORAGE_KEYS.PROFILES,
        STORAGE_KEYS.ACTIVE_PROFILE_ID,
      ]);

      const savedProfiles: Profile[] = profilesRaw[1] ? JSON.parse(profilesRaw[1]) : [];
      const activeId: string | null = activeIdRaw[1];

      // Seed a default profile if none exist
      if (savedProfiles.length === 0) {
        const defaultProfile: Profile = {
          id: Date.now().toString(),
          name: 'My Profile',
          avatar: '🎓',
          subjects: [
            { id: '1', name: 'Mathematics', icon: '☕' },
            { id: '2', name: 'Science', icon: '🍵' },
            { id: '3', name: 'History', icon: '🥤' },
            { id: '4', name: 'Programming', icon: '🧋' },
          ],
          createdAt: Date.now(),
        };
        const initialProfiles = [defaultProfile];
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(initialProfiles));
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, defaultProfile.id);
        setProfiles(initialProfiles);
        setActiveProfileState(defaultProfile);
      } else {
        setProfiles(savedProfiles);
        const found = savedProfiles.find(p => p.id === activeId) || savedProfiles[0];
        setActiveProfileState(found);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistProfiles = async (updated: Profile[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated));
    setProfiles(updated);
  };

  const setActiveProfile = async (profile: Profile) => {
    setActiveProfileState(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, profile.id);
  };

  const addProfile = async (name: string, avatar: string): Promise<Profile> => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: name.trim(),
      avatar,
      subjects: [],
      createdAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    await persistProfiles(updated);
    return newProfile;
  };

  const updateProfile = async (profile: Profile) => {
    const updated = profiles.map(p => (p.id === profile.id ? profile : p));
    await persistProfiles(updated);
    if (activeProfile?.id === profile.id) {
      setActiveProfileState(profile);
    }
  };

  const deleteProfile = async (profileId: string) => {
    const updated = profiles.filter(p => p.id !== profileId);
    await persistProfiles(updated);
    if (activeProfile?.id === profileId) {
      const next = updated[0] || null;
      setActiveProfileState(next);
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVE_PROFILE_ID,
        next ? next.id : '',
      );
    }
  };

  const addSubjectToProfile = async (profileId: string, subject: Subject) => {
    const updated = profiles.map(p => {
      if (p.id !== profileId) return p;
      return { ...p, subjects: [...p.subjects, subject] };
    });
    await persistProfiles(updated);
    const updatedProfile = updated.find(p => p.id === profileId);
    if (activeProfile?.id === profileId && updatedProfile) {
      setActiveProfileState(updatedProfile);
    }
  };

  const removeSubjectFromProfile = async (profileId: string, subjectId: string) => {
    const updated = profiles.map(p => {
      if (p.id !== profileId) return p;
      return { ...p, subjects: p.subjects.filter(s => s.id !== subjectId) };
    });
    await persistProfiles(updated);
    const updatedProfile = updated.find(p => p.id === profileId);
    if (activeProfile?.id === profileId && updatedProfile) {
      setActiveProfileState(updatedProfile);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        setActiveProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        addSubjectToProfile,
        removeSubjectFromProfile,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
