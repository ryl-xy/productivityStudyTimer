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
                  <Text style={{fontSize: 12, fontWeight: '600'}}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    borderTopWidth: 5,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  editModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  subjectOption: {
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 4,
  },
  subjectOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
});

export {AddTaskModal, EditTodoModal};
