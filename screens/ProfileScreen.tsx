import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ImageBackground,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useProfile, Profile, Subject} from '../context/profileContext.tsx';

const AVATAR_OPTIONS = [
  '🎓',
  '📚',
  '🧑‍💻',
  '👩‍🔬',
  '👨‍🎨',
  '🏆',
  '🌟',
  '🦁',
  '🐯',
  '🦊',
  '🐸',
  '🌈',
  '🚀',
  '⚡',
  '🎯',
  '🔥',
];

const DRINK_ICONS = [
  {name: '☕', label: 'Coffee'},
  {name: '🍵', label: 'Tea'},
  {name: '🥤', label: 'Soda'},
  {name: '🧋', label: 'Bubble Tea'},
  {name: '🍶', label: 'Sake'},
  {name: '🧃', label: 'Juice'},
];

// ─── Create / Edit Profile Modal ──────────────────────────────────────────────
function ProfileFormModal({
  visible,
  initial,
  onSave,
  onCancel,
}: {
  visible: boolean;
  initial?: Profile;
  onSave: (name: string, avatar: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? '🎓');

  // reset when modal opens/initial changes
  React.useEffect(() => {
    setName(initial?.name ?? '');
    setAvatar(initial?.avatar ?? '🎓');
  }, [visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a profile name.');
      return;
    }
    onSave(name.trim(), avatar);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modal.backdrop}>
        <View style={modal.card}>
          <Text style={modal.title}>
            {initial ? 'Edit Profile' : 'New Profile'}
          </Text>

          <Text style={modal.label}>Name</Text>
          <TextInput
            style={modal.input}
            placeholder="e.g. Alice"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />

          <Text style={modal.label}>Pick an Avatar</Text>
          <View style={modal.avatarGrid}>
            {AVATAR_OPTIONS.map(a => (
              <TouchableOpacity
                key={a}
                style={[modal.avatarBtn, avatar === a && modal.avatarSelected]}
                onPress={() => setAvatar(a)}>
                <Text style={modal.avatarEmoji}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={modal.row}>
            <TouchableOpacity
              style={[modal.btn, modal.cancel]}
              onPress={onCancel}>
              <Text style={modal.btnTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modal.btn, modal.save]}
              onPress={handleSave}>
              <Text style={modal.btnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Manage Subjects Modal ─────────────────────────────────────────────────────
function SubjectsModal({
  visible,
  profile,
  onClose,
}: {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
}) {
  const {addSubjectToProfile, removeSubjectFromProfile} = useProfile();
  const [subjectName, setSubjectName] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('☕');
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!profile) return null;

  const handleAdd = async () => {
    if (!subjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name.');
      return;
    }

    setIsAdding(true);
    try {
      const newSubject: Subject = {
        id: 0,
        name: subjectName.trim(),
        drink_icon: selectedDrink,
        color: '#8B4513',
        profile_id: profile.id,
      };
      await addSubjectToProfile(profile.id, newSubject);
      setSubjectName('');
      setSelectedDrink('☕');
      setShowDrinkPicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add subject. Please try again.');
      console.error('Error adding subject:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (subjectId: string | number, subjectName: string) => {
    Alert.alert(
      'Remove Subject',
      `Remove "${subjectName}" from this profile?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSubjectFromProfile(profile.id, subjectId),
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modal.backdrop}>
        <View style={[modal.card, {maxHeight: '85%'}]}>
          <Text style={modal.title}>
            {profile.avatar} {profile.name}'s Subjects
          </Text>

          <ScrollView style={{marginBottom: 12}}>
            {profile.subjects.length === 0 ? (
              <Text style={subj.empty}>No subjects yet. Add one below!</Text>
            ) : (
              profile.subjects.map(s => (
                <View key={s.id} style={subj.row}>
                  <Text style={subj.icon}>{s.drink_icon}</Text>
                  <Text style={subj.name}>{s.name}</Text>
                  <TouchableOpacity onPress={() => handleDelete(s.id, s.name)}>
                    <Icon name="trash-outline" size={20} color="#c0392b" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Add subject form */}
          <TextInput
            style={modal.input}
            placeholder="New subject name"
            placeholderTextColor="#aaa"
            value={subjectName}
            onChangeText={setSubjectName}
            editable={!isAdding}
          />
          <TouchableOpacity
            style={subj.drinkSelector}
            onPress={() => setShowDrinkPicker(!showDrinkPicker)}
            disabled={isAdding}>
            <Text style={subj.drinkSelectorText}>Icon: {selectedDrink} ▾</Text>
          </TouchableOpacity>
          {showDrinkPicker && (
            <View style={subj.drinkGrid}>
              {DRINK_ICONS.map(d => (
                <TouchableOpacity
                  key={d.name}
                  style={subj.drinkOpt}
                  onPress={() => {
                    setSelectedDrink(d.name);
                    setShowDrinkPicker(false);
                  }}>
                  <Text style={subj.drinkEmoji}>{d.name}</Text>
                  <Text style={subj.drinkLabel}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={modal.row}>
            <TouchableOpacity
              style={[modal.btn, modal.cancel]}
              onPress={onClose}
              disabled={isAdding}>
              <Text style={modal.btnTxt}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modal.btn, modal.save]}
              onPress={handleAdd}
              disabled={isAdding}>
              <Text style={modal.btnTxt}>
                {isAdding ? 'Adding...' : 'Add Subject'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main ProfileScreen ────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    isLoading,
  } = useProfile();

  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(
    undefined,
  );
  const [managingProfile, setManagingProfile] = useState<Profile | null>(null);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8b4513" />
      </View>
    );
  }

  const handleSaveProfile = async (name: string, avatar: string) => {
    if (editingProfile) {
      await updateProfile({...editingProfile, name, avatar});
    } else {
      const created = await addProfile(name, avatar);
      // Auto-switch to newly created profile
      await setActiveProfile(created);
    }
    setShowForm(false);
    setEditingProfile(undefined);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDelete = (profile: Profile) => {
    if (profiles.length === 1) {
      Alert.alert('Cannot Delete', 'You need at least one profile.');
      return;
    }
    Alert.alert(
      'Delete Profile',
      `Delete "${profile.name}"? This will also remove all their subjects.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProfile(profile.id),
        },
      ],
    );
  };

  const renderProfile = ({item}: {item: Profile}) => {
    const isActive = item.id === activeProfile?.id;
    return (
      <View style={[styles.card, isActive && styles.cardActive]}>
        <TouchableOpacity
          style={styles.cardLeft}
          onPress={() => setActiveProfile(item)}
          activeOpacity={0.7}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <View>
            <Text style={styles.profileName}>{item.name}</Text>
            <Text style={styles.subjectCount}>
              {item.subjects.length} subject
              {item.subjects.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setManagingProfile(item)}>
            <Icon name="book-outline" size={20} color="#8b4513" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEdit(item)}>
            <Icon name="pencil-outline" size={20} color="#8b4513" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item)}>
            <Icon name="trash-outline" size={20} color="#c0392b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.bg}
      blurRadius={2}>
      <View style={styles.overlay}>
        <Text style={styles.title}>👤 Profiles</Text>
        <Text style={styles.subtitle}>
          Tap a profile to set it as active. Each profile has its own subject
          list.
        </Text>

        <FlatList
          data={profiles}
          keyExtractor={p => p.id.toString()}
          renderItem={renderProfile}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No profiles yet. Create one!</Text>
          }
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingProfile(undefined);
            setShowForm(true);
          }}>
          <Icon name="add-circle" size={22} color="#fff" />
          <Text style={styles.addBtnText}>New Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Create / Edit Profile Modal */}
      <ProfileFormModal
        visible={showForm}
        initial={editingProfile}
        onSave={handleSaveProfile}
        onCancel={() => {
          setShowForm(false);
          setEditingProfile(undefined);
        }}
      />

      {/* Manage Subjects Modal */}
      <SubjectsModal
        visible={managingProfile !== null}
        profile={managingProfile}
        onClose={() => setManagingProfile(null)}
      />
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    paddingTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#e0d5c5',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {paddingBottom: 20},
  empty: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(255,248,220,0.95)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: '#8b4513',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 38,
    marginRight: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  subjectCount: {
    fontSize: 13,
    color: '#8b4513',
    marginTop: 2,
  },
  activeBadge: {
    marginLeft: 10,
    backgroundColor: '#8b4513',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  addBtn: {
    backgroundColor: '#8b4513',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

const modal = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff8dc',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C3A21',
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b4513',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    color: '#333',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  avatarBtn: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  avatarSelected: {
    backgroundColor: 'rgba(139,69,19,0.2)',
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancel: {backgroundColor: '#999', marginRight: 8},
  save: {backgroundColor: '#8b4513', marginLeft: 8},
  btnTxt: {color: '#fff', fontWeight: 'bold', fontSize: 15},
});

const subj = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  icon: {fontSize: 24, marginRight: 10},
  name: {flex: 1, fontSize: 16, color: '#333'},
  empty: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
  drinkSelector: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  drinkSelectorText: {fontSize: 16, color: '#333'},
  drinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  drinkOpt: {width: '33%', alignItems: 'center', padding: 8},
  drinkEmoji: {fontSize: 28},
  drinkLabel: {fontSize: 11, color: '#666', marginTop: 4},
});
