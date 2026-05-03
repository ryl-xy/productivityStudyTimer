// screens/TimerSelectionScreen.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { TimerSelectionScreenProps } from '../types/navigation';
import { useProfile, Subject } from '../context/profileContext.tsx';
import { useStudy } from '../context/studyContext.tsx';
import {CustomInput} from '../components/UI.tsx';
import { useFocusEffect } from '@react-navigation/native';

const DRINK_ICONS = [
  {id: '1', name: '☕', label: 'Coffee'},
  {id: '2', name: '🍵', label: 'Tea'},
  {id: '3', name: '🥤', label: 'Soda'},
  {id: '4', name: '🧋', label: 'Bubble Tea'},
  {id: '5', name: '🍶', label: 'Sake'},
  {id: '6', name: '🧃', label: 'Juice'},
];

export default function TimerSelectionScreen({
  navigation,
}: TimerSelectionScreenProps) {
  const {activeProfile, addSubjectToProfile, removeSubjectFromProfile, refreshProfiles} = useProfile();
  const {getSubjectStudyTime, formatTime} = useStudy();

  const [showManageModal, setShowManageModal] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectTimes, setSubjectTimes] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Add new subject state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('☕');
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);

  // Edit subject state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('☕');

  // Load subjects from active profile
  useFocusEffect(
    useCallback(() => {
      if(activeProfile){
        setSubjects(activeProfile.subjects || []);
        loadSubjectTimes(activeProfile.subjects || []);
      }
    }, [activeProfile])
  );

  const loadSubjectTimes = async (subjectList: Subject[]) => {
    const times: { [key: string]: number } = {};
    for (const subject of subjectList) {
      const time = await getSubjectStudyTime(subject.name);
      times[subject.id.toString()] = time;
    }
    setSubjectTimes(times);
  };

  const handleTimerSelect = (
    subject: Subject,
    timerType: 'countup' | 'pomodoro',
  ) => {
    if (timerType === 'countup') {
      navigation.navigate('CountUpTimer', {subjectName: subject.name});
    } else {
      navigation.navigate('PomodoroTimer', {subjectName: subject.name});
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }
    if (!activeProfile) {
      Alert.alert('Error', 'No active profile selected');
      return;
    }

    setIsLoading(true);
    try {
      const colors = [
        '#FF5733',
        '#33FF57',
        '#3357FF',
        '#FF33F5',
        '#FFD700',
        '#FF6B6B',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const subjectData: Subject = {
        id: 0,
        name: newSubjectName.trim(),
        drink_icon: selectedDrink,
        color: randomColor,
      };

      await addSubjectToProfile(activeProfile.id, subjectData);
      await refreshProfiles();

      Toast.show({
        type: 'success',
        text1: 'Subject added!',
        position: 'bottom',
      });

      setNewSubjectName('');
      setSelectedDrink('☕');
      setShowDrinkPicker(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      Alert.alert('Error', 'Failed to add subject. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditName(subject.name);
    setEditIcon(subject.drink_icon);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Subject name cannot be empty');
      return;
    }

    if (!editingSubject || !activeProfile) {
      return;
    }

    setIsLoading(true);
    try {
      // Since you don't have an update endpoint, we'll delete and re-add
      await removeSubjectFromProfile(activeProfile.id, editingSubject.id);
      
      const updatedSubject: Subject = {
        id: 0,
        name: editName.trim(),
        drink_icon: editIcon,
        color: editingSubject.color,
      };

      await addSubjectToProfile(activeProfile.id, updatedSubject);
      await refreshProfiles();

      Toast.show({
        type: 'success',
        text1: 'Subject updated!',
        position: 'bottom',
      });

      setEditingSubject(null);
    } catch (error) {
      console.error('Error updating subject:', error);
      Alert.alert('Error', 'Failed to update subject. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = (subject: Subject) => {
    if (!activeProfile) return;

    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete "${subject.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeSubjectFromProfile(activeProfile.id, subject.id);
              await refreshProfiles();
              Toast.show({
                type: 'success',
                text1: 'Subject deleted!',
                position: 'bottom',
              });
            } catch (error) {
              console.error('Error deleting subject:', error);
              Alert.alert('Error', 'Failed to delete subject.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderSubject = ({item}: {item: Subject}) => {
    const studyTime = subjectTimes[item.id.toString()] || 0;
    const displayTime = formatTime(studyTime);

    return (
      <View style={styles.subjectCard}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectIcon}>{item.drink_icon}</Text>
          <View style={styles.subjectTextContainer}>
            <Text style={styles.subjectName}>{item.name}</Text>
            <Text style={styles.subjectTime}>{displayTime}</Text>
          </View>
        </View>

        <View style={styles.timerButtons}>
          <TouchableOpacity
            style={[styles.timerButton, styles.countUpButton]}
            onPress={() => handleTimerSelect(item, 'countup')}>
            <Text style={styles.timerButtonText}>⏱️ Count Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timerButton, styles.pomodoroButton]}
            onPress={() => handleTimerSelect(item, 'pomodoro')}>
            <Text style={styles.timerButtonText}>🍅 Pomodoro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      blurRadius={2}>
      <View style={styles.overlay}>
        {/* Active profile header */}
        {activeProfile && (
          <View style={styles.profileBanner}>
            <Text style={styles.profileBannerAvatar}>
              {activeProfile.avatar}
            </Text>
            <Text style={styles.profileBannerName}>{activeProfile.name}</Text>
          </View>
        )}

        <Text style={styles.title}>📚 Choose Your Study Session</Text>

        {subjects.length === 0 && (
          <Text style={styles.emptyText}>
            No subjects yet! Create one by clicking "Manage Subjects" below.
          </Text>
        )}

        <FlatList
          data={subjects}
          keyExtractor={item => item.id.toString()}
          renderItem={renderSubject}
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowManageModal(true)}>
          <Icon name="create-outline" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Manage Subjects</Text>
        </TouchableOpacity>
      </View>

      {/* Manage Subjects Modal */}
      <Modal visible={showManageModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Manage Subjects</Text>

            <ScrollView style={styles.subjectsList} nestedScrollEnabled>
              {subjects.map(subject => (
                <View key={subject.id} style={styles.subjectRow}>
                  <Text style={styles.rowIcon}>{subject.drink_icon}</Text>
                  <Text style={styles.rowName}>{subject.name}</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditSubject(subject)}
                    disabled={isLoading}>
                    <Icon name="pencil-outline" size={18} color="#8B4513" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteSubject(subject)}
                    disabled={isLoading}>
                    <Icon name="trash-outline" size={18} color="#c0392b" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Add New Subject Form */}
            <Text style={styles.formLabel}>Add New Subject</Text>
            <CustomInput
              placeholder="Subject Name"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.drinkSelector}
              onPress={() => setShowDrinkPicker(!showDrinkPicker)}
              disabled={isLoading}>
              <Text style={styles.drinkSelectorText}>Icon: {selectedDrink} ▾</Text>
            </TouchableOpacity>

            {showDrinkPicker && (
              <View style={styles.drinkGrid}>
                {DRINK_ICONS.map(drink => (
                  <TouchableOpacity
                    key={drink.name}
                    style={styles.drinkOption}
                    onPress={() => {
                      setSelectedDrink(drink.name);
                      setShowDrinkPicker(false);
                    }}>
                    <Text style={styles.drinkEmoji}>{drink.name}</Text>
                    <Text style={styles.drinkLabel}>{drink.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowManageModal(false);
                  setNewSubjectName('');
                  setSelectedDrink('☕');
                }}
                disabled={isLoading}>
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.addBtn]}
                onPress={handleAddSubject}
                disabled={isLoading}>
                <Text style={styles.modalBtnText}>
                  {isLoading ? 'Adding...' : 'Add Subject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal visible={editingSubject !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Subject</Text>

            <Text style={styles.formLabel}>Subject Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter subject name"
              editable={!isLoading}
            />

            <Text style={styles.formLabel}>Icon</Text>
            <TouchableOpacity
              style={styles.drinkSelector}
              onPress={() => setShowDrinkPicker(!showDrinkPicker)}
              disabled={isLoading}>
              <Text style={styles.drinkSelectorText}>Icon: {editIcon} ▾</Text>
            </TouchableOpacity>

            {showDrinkPicker && (
              <View style={styles.drinkGrid}>
                {DRINK_ICONS.map(drink => (
                  <TouchableOpacity
                    key={drink.name}
                    style={styles.drinkOption}
                    onPress={() => {
                      setEditIcon(drink.name);
                      setShowDrinkPicker(false);
                    }}>
                    <Text style={styles.drinkEmoji}>{drink.name}</Text>
                    <Text style={styles.drinkLabel}>{drink.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditingSubject(null)}
                disabled={isLoading}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.addBtn]}
                onPress={handleSaveEdit}
                disabled={isLoading}>
                <Text style={styles.modalBtnText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {flex: 1},

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },

  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,69,19,0.8)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },

  profileBannerAvatar: {
    fontSize: 20, 
    marginRight: 8
  },

  profileBannerName: {
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 15
  },
  
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },

  emptyText: {
    color: '#e0d5c5',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },

  listContainer: {paddingBottom: 20},

  subjectCard: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  subjectIcon: {fontSize: 36, marginRight: 12},

  subjectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C3A21',
  },

  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  countUpButton: {backgroundColor: '#8B4513'},

  pomodoroButton: {backgroundColor: '#D2691E'},

  timerButtonText: {
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: 'bold'
  },
  
  addButton: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  subjectTextContainer: {
    flex: 1,
  },

  subjectTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#fff8dc',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C3A21',
    marginBottom: 15,
    textAlign: 'center',
  },

  subjectsList: {
    maxHeight: 150,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 8,
  },

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  rowIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  rowName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  editBtn: {
    padding: 6,
    marginRight: 8,
  },

  deleteBtn: {
    padding: 6,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
    marginTop: 10,
  },

  drinkSelector: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },

  drinkSelectorText: {
    fontSize: 14,
    color: '#333',
  },

  drinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },

  drinkOption: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
  },

  drinkEmoji: {
    fontSize: 24,
  },

  drinkLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelBtn: {
    backgroundColor: '#999',
    marginRight: 8,
  },

  addBtn: {
    backgroundColor: '#8B4513',
    marginLeft: 8,
  },

  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
});