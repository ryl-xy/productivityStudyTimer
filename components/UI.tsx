import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const DatePickerInput = ({value, onChange, placeholder}: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Input Box */}
      <TouchableOpacity onPress={() => setOpen(true)}>
        <View style={DatePickerInputstyles.input}>
          <Text style={{color: value ? '#3d1f05' : '#999'}}>
            {value
              ? new Date(value).toISOString().split('T')[0]
              : placeholder || 'Select Date'}
          </Text>
          <Icon name="calendar-outline" size={18} color="#8b4513" />
        </View>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={value ? new Date(value) : new Date()}
        mode="date"
        onConfirm={date => {
          setOpen(false);
          onChange(date.toISOString());
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

const DatePickerInputstyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e8d5b0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#fffdf5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const CustomInput = (props: any) => {
  return (
    <TextInput {...props} style={[CustomInputstyles.input, props.style]} />
  );
};

const CustomInputstyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e8d5b0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: '#fffdf5',
    color: '#3d1f05',
  },
});

const PrioritySelector = ({priority, setPriority}: any) => {
  const options = ['no', 'low', 'medium', 'high'];

  return (
    <View style={Prioritystyles.container}>
      <Text style={Prioritystyles.label}>Priority</Text>
      <View style={Prioritystyles.row}>
        {options.map(p => (
          <TouchableOpacity
            key={p}
            style={[
              Prioritystyles.option,
              priority === p && Prioritystyles.selected,
            ]}
            onPress={() => setPriority(p)}>
            <Text style={{color: priority === p ? '#fff' : '#8b4513'}}>
              {p === 'no' ? 'None' : p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const Prioritystyles = StyleSheet.create({
  container: {marginBottom: 12},
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    color: '#8b4513',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5e8c8',
    borderRadius: 8,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#8b4513',
  },
});

export {PrioritySelector, CustomInput, DatePickerInput};
