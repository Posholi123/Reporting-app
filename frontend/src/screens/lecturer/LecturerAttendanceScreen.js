import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

export default function LecturerAttendanceScreen() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/classes?lecturerId=${user.uid}`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Error', 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForClass = async (classId) => {
    setLoadingAttendance(true);
    try {
      const response = await fetch(`${API_BASE}/attendance/by-class?classId=${classId}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load attendance');
      setStudents([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    fetchStudentsForClass(classItem.id);
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity style={styles.classCard} onPress={() => handleClassSelect(item)}>
      <Text style={styles.classTitle}>{item.courseName} ({item.courseCode})</Text>
      <Text style={styles.classDate}>Date: {item.date} | Topic: {item.topic}</Text>
    </TouchableOpacity>
  );

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <Text style={styles.studentName}>{item.name || item.email}</Text>
      <Text style={styles.studentEmail}>{item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance per Class</Text>
      {selectedClass ? (
        <>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedClass(null)}>
            <Text style={styles.backButtonText}>← Back to Classes</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>
            Students who marked attendance for: {selectedClass.courseName}
          </Text>
          {loadingAttendance ? (
            <ActivityIndicator size="large" color={colors.textPrimary} />
          ) : students.length === 0 ? (
            <Text style={styles.noData}>No students marked attendance yet.</Text>
          ) : (
            <FlatList
              data={students}
              keyExtractor={(item) => item.id}
              renderItem={renderStudentItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Select a class to see attendance:</Text>
          {classes.length === 0 ? (
            <Text style={styles.noData}>No classes found.</Text>
          ) : (
            <FlatList
              data={classes}
              keyExtractor={(item) => item.id}
              renderItem={renderClassItem}
            />
          )}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  classCard: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  classDate: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 5,
  },
  studentCard: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  studentEmail: {
    fontSize: 14,
    color: colors.textMuted,
  },
  backButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  noData: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 30,
  },
});