import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

interface Schedule {
  id: string;
  name: string;
  location: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;
  note: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@timetable_schedules';

const SUBJECT_COLORS = [
  '#c0392b', // red
  '#8b4513', // saddle brown (app primary)
  '#d35400', // orange
  '#c27321', // warm amber
  '#2e86de', // blue
  '#1a8a6b', // teal
  '#7d3c98', // purple
  '#2c7873', // dark teal
];

const HOURS = Array.from({length: 24}, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function today(): DayOfWeek {
  const day = new Date().getDay(); // 0=Sun
  const map: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return map[day];
}

// ─── Time Picker Modal ────────────────────────────────────────────────────────

function TimePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  value: string;
  onConfirm: (time: string) => void;
  onClose: () => void;
}) {
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h);
      setMinute(m);
    }
  }, [value, visible]);

  const hours = Array.from({length: 24}, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={tp.backdrop}>
        <View style={tp.card}>
          <Text style={tp.title}>Select Time</Text>
          <View style={tp.row}>
            {/* Hour */}
            <View style={tp.col}>
              <Text style={tp.colLabel}>Hour</Text>
              <ScrollView style={tp.scroll} showsVerticalScrollIndicator={false}>
                {hours.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[tp.item, hour === h && tp.itemSelected]}
                    onPress={() => setHour(h)}>
                    <Text
                      style={[tp.itemText, hour === h && tp.itemTextSelected]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={tp.colon}>:</Text>
            {/* Minute */}
            <View style={tp.col}>
              <Text style={tp.colLabel}>Min</Text>
              <ScrollView style={tp.scroll} showsVerticalScrollIndicator={false}>
                {minutes.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[tp.item, minute === m && tp.itemSelected]}
                    onPress={() => setMinute(m)}>
                    <Text
                      style={[tp.itemText, minute === m && tp.itemTextSelected]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={tp.actions}>
            <TouchableOpacity style={tp.cancelBtn} onPress={onClose}>
              <Text style={tp.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tp.confirmBtn}
              onPress={() => {
                onConfirm(`${hour}:${minute}`);
                onClose();
              }}>
              <Text style={tp.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Schedule Form Modal ──────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Schedule, 'id'> = {
  name: '',
  location: '',
  day: 'Monday',
  startTime: '08:00',
  endTime: '09:00',
  color: SUBJECT_COLORS[1],
  note: '',
};

function ScheduleFormModal({
  visible,
  initial,
  onSave,
  onClose,
}: {
  visible: boolean;
  initial?: Schedule;
  onSave: (data: Omit<Schedule, 'id'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Schedule, 'id'>>(EMPTY_FORM);
  const [timePickerTarget, setTimePickerTarget] = useState<
    'start' | 'end' | null
  >(null);

  useEffect(() => {
    if (visible) {
      setForm(initial ? {...initial} : {...EMPTY_FORM});
    }
  }, [visible]);

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('Missing Info', 'Please enter a schedule name.');
      return;
    }
    if (timeToMinutes(form.startTime) >= timeToMinutes(form.endTime)) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={fm.backdrop}>
        <View style={fm.card}>
          <View style={fm.header}>
            <Text style={fm.title}>
              {initial ? 'Edit Schedule' : 'New Schedule'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#8b4513" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={fm.label}>Class / Subject Name *</Text>
            <TextInput
              style={fm.input}
              placeholder="e.g. Mathematics, Physics..."
              placeholderTextColor="#b8a99a"
              value={form.name}
              onChangeText={v => setForm(f => ({...f, name: v}))}
            />

            {/* Location */}
            <Text style={fm.label}>Location / Room</Text>
            <TextInput
              style={fm.input}
              placeholder="e.g. Room 301, Lab B..."
              placeholderTextColor="#b8a99a"
              value={form.location}
              onChangeText={v => setForm(f => ({...f, location: v}))}
            />

            {/* Day */}
            <Text style={fm.label}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={fm.dayRow}>
              {DAYS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[fm.dayChip, form.day === d && fm.dayChipActive]}
                  onPress={() => setForm(f => ({...f, day: d}))}>
                  <Text
                    style={[
                      fm.dayChipText,
                      form.day === d && fm.dayChipTextActive,
                    ]}>
                    {DAY_SHORT[d]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time */}
            <Text style={fm.label}>Time</Text>
            <View style={fm.timeRow}>
              <TouchableOpacity
                style={fm.timePicker}
                onPress={() => setTimePickerTarget('start')}>
                <Icon name="time-outline" size={16} color="#8b4513" />
                <Text style={fm.timeText}>{formatTime(form.startTime)}</Text>
              </TouchableOpacity>
              <Text style={fm.timeSep}>→</Text>
              <TouchableOpacity
                style={fm.timePicker}
                onPress={() => setTimePickerTarget('end')}>
                <Icon name="time-outline" size={16} color="#8b4513" />
                <Text style={fm.timeText}>{formatTime(form.endTime)}</Text>
              </TouchableOpacity>
            </View>

            {/* Color */}
            <Text style={fm.label}>Color</Text>
            <View style={fm.colorRow}>
              {SUBJECT_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    fm.colorDot,
                    {backgroundColor: c},
                    form.color === c && fm.colorDotSelected,
                  ]}
                  onPress={() => setForm(f => ({...f, color: c}))}
                />
              ))}
            </View>

            {/* Note */}
            <Text style={fm.label}>Notes (optional)</Text>
            <TextInput
              style={[fm.input, fm.noteInput]}
              placeholder="Any extra notes..."
              placeholderTextColor="#b8a99a"
              value={form.note}
              onChangeText={v => setForm(f => ({...f, note: v}))}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={fm.saveBtn} onPress={handleSave}>
              <Text style={fm.saveBtnText}>
                {initial ? 'Save Changes' : 'Add Schedule'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Time Picker */}
      <TimePickerModal
        visible={timePickerTarget !== null}
        value={
          timePickerTarget === 'start' ? form.startTime : form.endTime
        }
        onConfirm={t => {
          if (timePickerTarget === 'start') {
            setForm(f => ({...f, startTime: t}));
          } else {
            setForm(f => ({...f, endTime: t}));
          }
        }}
        onClose={() => setTimePickerTarget(null)}
      />
    </Modal>
  );
}

// ─── Schedule Card ────────────────────────────────────────────────────────────

function ScheduleCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Schedule;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[sc.card, {borderLeftColor: item.color}]}>
      <View style={sc.left}>
        <View style={[sc.colorBar, {backgroundColor: item.color}]} />
      </View>
      <View style={sc.body}>
        <Text style={sc.name}>{item.name}</Text>
        <View style={sc.metaRow}>
          <Icon name="time-outline" size={13} color="#8b4513" />
          <Text style={sc.meta}>
            {formatTime(item.startTime)} – {formatTime(item.endTime)}
          </Text>
        </View>
        {!!item.location && (
          <View style={sc.metaRow}>
            <Icon name="location-outline" size={13} color="#8b4513" />
            <Text style={sc.meta}>{item.location}</Text>
          </View>
        )}
        {!!item.note && <Text style={sc.note}>{item.note}</Text>}
      </View>
      <View style={sc.actions}>
        <TouchableOpacity onPress={onEdit} style={sc.actionBtn}>
          <Icon name="create-outline" size={20} color="#8b4513" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={sc.actionBtn}>
          <Icon name="trash-outline" size={20} color="#c0392b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TimetableScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(today());
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | undefined>(
    undefined,
  );

  // Load from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        setSchedules(JSON.parse(raw));
      }
    });
  }, []);

  const persist = useCallback((next: Schedule[]) => {
    setSchedules(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const handleAdd = (data: Omit<Schedule, 'id'>) => {
    const next: Schedule = {...data, id: Date.now().toString()};
    persist([...schedules, next]);
  };

  const handleEdit = (data: Omit<Schedule, 'id'>) => {
    if (!editTarget) return;
    const next = schedules.map(s =>
      s.id === editTarget.id ? {...data, id: editTarget.id} : s,
    );
    persist(next);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Schedule', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => persist(schedules.filter(s => s.id !== id)),
      },
    ]);
  };

  // Schedules for selected day, sorted by start time
  const daySchedules = schedules
    .filter(s => s.day === selectedDay)
    .sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8dc" />

      {/* Day Tabs */}
      <View style={styles.dayBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayBarContent}>
          {DAYS.map(d => {
            const isToday = d === today();
            const isSelected = d === selectedDay;
            const count = schedules.filter(s => s.day === d).length;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.dayTab, isSelected && styles.dayTabActive]}
                onPress={() => setSelectedDay(d)}>
                <Text
                  style={[
                    styles.dayTabText,
                    isSelected && styles.dayTabTextActive,
                  ]}>
                  {DAY_SHORT[d]}
                </Text>
                {isToday && <View style={styles.todayDot} />}
                {count > 0 && (
                  <View
                    style={[
                      styles.badge,
                      isSelected && styles.badgeActive,
                    ]}>
                    <Text
                      style={[
                        styles.badgeText,
                        isSelected && styles.badgeTextActive,
                      ]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Day Header */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>
          {selectedDay}
          {selectedDay === today() ? (
            <Text style={styles.todayBadge}> · Today</Text>
          ) : null}
        </Text>
        <Text style={styles.dayCount}>
          {daySchedules.length === 0
            ? 'No classes'
            : `${daySchedules.length} class${daySchedules.length > 1 ? 'es' : ''}`}
        </Text>
      </View>

      {/* List */}
      {daySchedules.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No schedules for {DAY_SHORT[selectedDay]}</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add a class or event.
          </Text>
        </View>
      ) : (
        <FlatList
          data={daySchedules}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <ScheduleCard
              item={item}
              onEdit={() => {
                setEditTarget(item);
                setModalVisible(true);
              }}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditTarget(undefined);
          setModalVisible(true);
        }}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Form Modal */}
      <ScheduleFormModal
        visible={modalVisible}
        initial={editTarget}
        onSave={editTarget ? handleEdit : handleAdd}
        onClose={() => {
          setModalVisible(false);
          setEditTarget(undefined);
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fdf6e3',
  },
  dayBar: {
    backgroundColor: '#fff8dc',
    borderBottomWidth: 1,
    borderBottomColor: '#f0dbb8',
    paddingVertical: 8,
  },
  dayBarContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5e8c8',
    marginHorizontal: 3,
    minWidth: 52,
    position: 'relative',
  },
  dayTabActive: {
    backgroundColor: '#8b4513',
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b4513',
  },
  dayTabTextActive: {
    color: '#fff',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#c27321',
    position: 'absolute',
    top: 4,
    right: 4,
  },
  badge: {
    backgroundColor: '#d2b48c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8b4513',
  },
  badgeTextActive: {
    color: '#fff',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5c2d0a',
  },
  todayBadge: {
    fontSize: 14,
    fontWeight: '500',
    color: '#c27321',
  },
  dayCount: {
    fontSize: 13,
    color: '#a0856a',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8b4513',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#b8a090',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#8b4513',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

// Schedule Card styles
const sc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#8b4513',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  left: {
    width: 0, // borderLeft is used instead
  },
  colorBar: {
    width: 0,
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3d1f05',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    color: '#7a5a40',
  },
  note: {
    fontSize: 12,
    color: '#a08060',
    marginTop: 5,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 10,
    gap: 6,
  },
  actionBtn: {
    padding: 6,
  },
});

// Form Modal styles
const fm = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff8dc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8b4513',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b4513',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#3d1f05',
    borderWidth: 1,
    borderColor: '#e8d5b0',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dayRow: {
    marginBottom: 4,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5e8c8',
    marginRight: 8,
  },
  dayChipActive: {
    backgroundColor: '#8b4513',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b4513',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e8d5b0',
  },
  timeText: {
    fontSize: 15,
    color: '#8b4513',
    fontWeight: '600',
  },
  timeSep: {
    fontSize: 18,
    color: '#8b4513',
    fontWeight: 'bold',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#3d1f05',
    transform: [{scale: 1.15}],
  },
  saveBtn: {
    backgroundColor: '#8b4513',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

// Time Picker styles
const tp = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff8dc',
    borderRadius: 20,
    padding: 24,
    width: 280,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8b4513',
    textAlign: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  col: {
    alignItems: 'center',
    width: 80,
  },
  colLabel: {
    fontSize: 12,
    color: '#a0856a',
    fontWeight: '600',
    marginBottom: 8,
  },
  scroll: {
    height: 160,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  itemSelected: {
    backgroundColor: '#8b4513',
  },
  itemText: {
    fontSize: 18,
    color: '#8b4513',
    textAlign: 'center',
    fontWeight: '600',
  },
  itemTextSelected: {
    color: '#fff',
  },
  colon: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8b4513',
    marginHorizontal: 8,
    marginTop: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#8b4513',
    alignItems: 'center',
  },
  cancelText: {
    color: '#8b4513',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#8b4513',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});
