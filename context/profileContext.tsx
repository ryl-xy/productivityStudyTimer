import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseUrl from '../API/index';

export interface Subject {
  id: string | number;
  name: string;
  drink_icon: string;
  color?: string;
  profile_id?: string | number;
}

export interface Profile {
  id: string | number;
  name: string;
  avatar: string;
  subjects: Subject[];
  created_at?: string;
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => Promise<void>;
  addProfile: (name: string, avatar: string) => Promise<Profile>;
  updateProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (profileId: string | number) => Promise<void>;
  addSubjectToProfile: (
    profileId: string | number,
    subject: Subject,
  ) => Promise<Subject>;
  removeSubjectFromProfile: (
    profileId: string | number,
    subjectId: string | number,
  ) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  ACTIVE_PROFILE_ID: 'active_profile_id',
};

const DEFAULT_SUBJECTS = [
  {name: 'Mathematics', drink_icon: '☕', color: '#FF5733'},
  {name: 'Science', drink_icon: '🍵', color: '#33FF57'},
  {name: 'History', drink_icon: '🥤', color: '#3357FF'},
  {name: 'Programming', drink_icon: '🧋', color: '#FF33F5'},
];

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({children}: {children: ReactNode}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profiles from API on mount
  useEffect(() => {
    loadProfilesFromAPI();
  }, []);

  const loadProfilesFromAPI = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(baseUrl + '/api/profiles');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const profilesData = await response.json();

      // Fetch subjects for each profile
      const profilesWithSubjects = await Promise.all(
        profilesData.map(async (profile: any) => {
          try {
            const subjectsRes = await fetch(
              baseUrl + `/api/profiles/${profile.id}/subjects`,
            );
            if (!subjectsRes.ok) throw new Error(`Failed to fetch subjects`);
            const subjects = await subjectsRes.json();
            return {...profile, subjects};
          } catch (error) {
            console.error(
              `Error fetching subjects for profile ${profile.id}:`,
              error,
            );
            return {...profile, subjects: []};
          }
        }),
      );

      setProfiles(profilesWithSubjects);

      // Load last active profile ID
      const activeId = await AsyncStorage.getItem(
        STORAGE_KEYS.ACTIVE_PROFILE_ID,
      );
      const active =
        profilesWithSubjects.find(p => p.id.toString() === activeId) ||
        profilesWithSubjects[0] ||
        null;
      setActiveProfileState(active);

      if (active) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACTIVE_PROFILE_ID,
          active.id.toString(),
        );
      }
    } catch (error) {
      console.error('Failed to load profiles from API:', error);
      setProfiles([]);
      setActiveProfileState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfiles = async () => {
    await loadProfilesFromAPI();
  };

  const setActiveProfile = async (profile: Profile) => {
    setActiveProfileState(profile);
    await AsyncStorage.setItem(
      STORAGE_KEYS.ACTIVE_PROFILE_ID,
      profile.id.toString(),
    );
  };

  const addProfile = async (name: string, avatar: string): Promise<Profile> => {
    try {
      const response = await fetch(baseUrl + '/api/profiles', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, avatar}),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const newProfile = await response.json();

      // Add default subjects to the new profile
      const subjectsWithDefaults = [];
      for (const defaultSubject of DEFAULT_SUBJECTS) {
        try {
          const subjectRes = await fetch(baseUrl + '/api/subjects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              name: defaultSubject.name,
              drink_icon: defaultSubject.drink_icon,
              color: defaultSubject.color,
              profile_id: newProfile.id,
            }),
          });
          if (subjectRes.ok) {
            const subject = await subjectRes.json();
            subjectsWithDefaults.push(subject);
          }
        } catch (err) {
          console.error(
            `Failed to add default subject ${defaultSubject.name}:`,
            err,
          );
        }
      }

      // Reload profiles to get the latest data
      await loadProfilesFromAPI();
      return {...newProfile, subjects: subjectsWithDefaults};
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  };

  const updateProfile = async (profile: Profile) => {
    try {
      const response = await fetch(baseUrl + `/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: profile.name, avatar: profile.avatar}),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      await loadProfilesFromAPI();
      if (activeProfile?.id === profile.id) {
        setActiveProfileState(profile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (profileId: string | number) => {
    try {
      const response = await fetch(baseUrl + `/api/profiles/${profileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      await loadProfilesFromAPI();
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  const addSubjectToProfile = async (
    profileId: string | number,
    subject: Subject,
  ): Promise<Subject> => {
    try {
      const response = await fetch(baseUrl + '/api/subjects', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: subject.name,
          drink_icon: subject.drink_icon,
          color: subject.color || '#8B4513',
          profile_id: profileId,
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const newSubject = await response.json();
      await loadProfilesFromAPI();
      return newSubject;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  };

  const removeSubjectFromProfile = async (
    profileId: string | number,
    subjectId: string | number,
  ) => {
    try {
      const response = await fetch(baseUrl + `/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      await loadProfilesFromAPI();
    } catch (error) {
      console.error('Error removing subject:', error);
      throw error;
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
        refreshProfiles,
        isLoading,
      }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}