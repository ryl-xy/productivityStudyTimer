import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const AddTaskModal = ({visible, subject, onClose, onAdd}: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('no');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      ToastAndroid.show('Please enter a task title', ToastAndroid.SHORT);
      return;
    }
    onAdd({
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subject.subject_id,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setTitle('');
    setDescription('');
    setPriority('no');
    setDueDate('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.addModal,
            {borderTopColor: subject?.color || '#8B4513'},
          ]}>
          <Text style={styles.addModalTitle}>
            Add Task to {subject?.subject_name}
          </Text>

          <TextInput
            style={styles.taskInput}
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TextInput
            style={[styles.taskInput, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.priorityContainer}>
            <Text style={styles.pickerLabel}>Priority</Text>
            <View style={styles.priorityOptions}>
              {['no', 'low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionSelected,
                  ]}
                  onPress={() => setPriority(p)}>
                  <Text style={{fontSize: 12, fontWeight: '600', color: priority === p ? '#fff' : '#8b4513'}}>
                    {p === 'no'
                      ? 'None'
                      : p === 'low'
                      ? 'Low'
                      : p === 'medium'
                      ? 'Medium'
                      : 'High'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.taskInput}
            placeholder="Due date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, {backgroundColor: subject?.color}]}
              onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Edit Todo Modal
const EditTodoModal = ({visible, todo, subjects, onClose, onSave}: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(null);
  const [priority, setPriority] = useState('no');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '');
      setDescription(todo.description || '');
      setSubjectId(todo.subject_id);
      setPriority(todo.priority || 'no');
      setDueDate(todo.due_date ? new Date(todo.due_date) : null);
    }
  }, [todo]);

  const handleSave = () => {
    if (!title.trim()) {
      ToastAndroid.show('Please enter a title', ToastAndroid.SHORT);
      return;
    }
    onSave({
      title: title.trim(),
      description,
      subject_id: subjectId,
      priority,
      due_date: dueDate ? dueDate.toISOString() : null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.editModal}>
          <Text style={styles.editModalTitle}>✏️ Edit Task</Text>

          <TextInput
            style={styles.editInput}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.editInput, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Subject</Text>
            {subjects.map((sub: any) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subjectOption,
                  subjectId === sub.id && styles.subjectOptionSelected,
                ]}
                onPress={() => setSubjectId(sub.id)}>
                <Text>
                  {sub.drink_icon} {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.priorityContainer}>
            <Text style={styles.pickerLabel}>Priority</Text>
            <View style={styles.priorityOptions}>
              {['no', 'low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionSelected,
                  ]}
                  onPress={() => setPriority(p)}>
                  <Text>
                    {p === 'no'
                      ? 'None'
                      : p === 'low'
                      ? 'Low'
                      : p === 'medium'
                      ? 'Medium'
                      : 'High'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModal: {
    backgroundColor: '#fff8dc',
    borderRadius: 20,
    padding: 22,
    width: '88%',
    borderTopWidth: 5,
    elevation: 6,
    shadowColor: '#8b4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  addModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5c2d0a',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#e8d5b0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: '#fffdf5',
    color: '#3d1f05',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    marginBottom: 14,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5e8c8',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: '#8b4513',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b4513',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e8d5b0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#8b4513',
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#8b4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  editModal: {
    backgroundColor: '#fff8dc',
    borderRadius: 20,
    padding: 22,
    width: '90%',
    maxHeight: '90%',
    elevation: 6,
    shadowColor: '#8b4513',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  editModalTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5c2d0a',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e8d5b0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: '#fffdf5',
    color: '#3d1f05',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#8b4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  subjectOption: {
    padding: 10,
    backgroundColor: '#f5e8c8',
    borderRadius: 8,
    marginBottom: 4,
  },
  subjectOptionSelected: {
    backgroundColor: '#d2a679',
  },
});

export {AddTaskModal, EditTodoModal};
