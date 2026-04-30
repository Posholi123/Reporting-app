import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';
import { fetchClasses, fetchAttendanceCount, submitReport } from '../../services/api';

export default function LecturerReportForm() {
  const [lecturerName, setLecturerName] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [courseNameCode, setCourseNameCode] = useState('');
  const [dateLecture, setDateLecture] = useState('');
  const [topicTaught, setTopicTaught] = useState('');
  const [studentsPresent, setStudentsPresent] = useState(0);
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setLecturerName(user.email);
      loadClasses(user.uid);
    }
  }, []);

  const loadClasses = async (lecturerId) => {
    try {
      const data = await fetchClasses(lecturerId);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Error', 'Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

const fetchAttendanceCountLocal = async (classId) => {
  console.log(' Fetching attendance count for classId:', classId);
  setAttendanceLoading(true);
  try {
    const count = await fetchAttendanceCount(classId);
    console.log('Attendance count received:', count);
    setStudentsPresent(typeof count === 'number' ? count : 0);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    setStudentsPresent(0);
  } finally {
    setAttendanceLoading(false);
  }
};

const handleClassChange = (classId) => {
  console.log('Selected class ID from picker:', classId);
  const selected = classes.find(c => c.id === classId);
  if (selected) {
    setSelectedClassId(classId);
    setCourseNameCode(`${selected.courseName} (${selected.courseCode})`);
    setDateLecture(selected.date);
    setTopicTaught(selected.topic);
    fetchAttendanceCountLocal(classId);
  } else {
    setSelectedClassId('');
    setCourseNameCode('');
    setDateLecture('');
    setTopicTaught('');
    setStudentsPresent(0);
  }
  setRecommendations('');
};

  const handleSubmit = async () => {
    if (!selectedClassId) {
      Alert.alert('Error', 'Please select a class');
      return;
    }
    if (!recommendations.trim()) {
      Alert.alert('Error', 'Please enter recommendations');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      const selectedClass = classes.find(c => c.id === selectedClassId);
      const reportData = {
        lecturerId: user.uid,
        lecturerName,
        classId: selectedClassId,
        courseNameCode: `${selectedClass.courseName} (${selectedClass.courseCode})`,
        date: dateLecture,
        topic: topicTaught,
        studentsPresent,
        recommendations,
      };
      const response = await submitReport(reportData, user.uid);
      if (response.success) {
        Alert.alert('Success', 'Report submitted via backend!');
        setSelectedClassId('');
        setCourseNameCode('');
        setDateLecture('');
        setTopicTaught('');
        setStudentsPresent(0);
        setRecommendations('');
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Submit Lecture Report</Text>

      {classes.length === 0 ? (
        <Text style={styles.warning}>No classes found. Please create a class first in the "Classes" tab.</Text>
      ) : (
        <>
          <Text style={styles.label}>Select Class *</Text>
          <Picker
            selectedValue={selectedClassId}
            onValueChange={handleClassChange}
            style={styles.picker}
            dropdownIconColor={colors.textPrimary}
          >
            <Picker.Item label="-- Choose a class --" value="" color={colors.textMuted} />
            {classes.map(cls => (
              <Picker.Item
                key={cls.id}
                label={`${cls.courseName} (${cls.courseCode}) - ${cls.date}`}
                value={cls.id}
                color={colors.white}
              />
            ))}
          </Picker>

          {selectedClassId && (
            <>
              <Text style={styles.label}>Course Name & Code (auto‑filled)</Text>
              <TextInput style={[styles.input, styles.disabledInput]} value={courseNameCode} editable={false} />

              <Text style={styles.label}>Date of Lecture (auto‑filled)</Text>
              <TextInput style={[styles.input, styles.disabledInput]} value={dateLecture} editable={false} />

              <Text style={styles.label}>Topic Taught (auto‑filled)</Text>
              <TextInput style={[styles.input, styles.disabledInput]} value={topicTaught} editable={false} multiline />

              <Text style={styles.label}>Number of Students Present (auto‑filled from attendance)</Text>
              {attendanceLoading ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <TextInput style={[styles.input, styles.disabledInput]} value={String(studentsPresent)} editable={false} />
              )}

              <Text style={styles.label}>Lecturer's Recommendations *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your recommendations here..."
                placeholderTextColor={colors.textMuted}
                value={recommendations}
                onChangeText={setRecommendations}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}> Submit Report</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: colors.header,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  warning: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.danger,
  },
  submitButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});