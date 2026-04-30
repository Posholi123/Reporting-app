import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

export default function StudentAttendanceScreen() {
  const [classes, setClasses] = useState([]);
  const [attendedMap, setAttendedMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch all classes from backend
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`);
      const data = await response.json();
      setClasses(data);
      return data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Error', 'Failed to load classes');
      return [];
    }
  };

  // Fetch attendance status for a student from backend
  const fetchAttendanceStatus = async (studentId, classList) => {
    try {
      const response = await fetch(`${API_BASE}/attendance/${studentId}`);
      const attendanceData = await response.json();
      const statusMap = {};
      classList.forEach(cls => {
        statusMap[cls.id] = attendanceData.some(a => a.classId === cls.id);
      });
      setAttendedMap(statusMap);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      Alert.alert('Error', 'Failed to load attendance status');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      setLoading(false);
      return;
    }
    const classList = await fetchClasses();
    if (classList.length > 0) {
      await fetchAttendanceStatus(user.uid, classList);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAttendance = async (classId) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          classId: classId,
          markedAt: new Date()
        })
      });
      if (response.ok) {
        Alert.alert('Success', 'Attendance marked successfully');
        setAttendedMap(prev => ({ ...prev, [classId]: true }));
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const renderClassItem = ({ item }) => {
    const isMarked = attendedMap[item.id] || false;
    return (
      <View style={styles.card}>
        <Text style={styles.courseTitle}>{item.courseName} ({item.courseCode})</Text>
        <Text style={styles.details}>Class Group: {item.className}</Text>
        <Text style={styles.details}>Topic: {item.topic}</Text>
        <Text style={styles.details}>Date: {item.date}</Text>
        {isMarked ? (
          <Text style={styles.markedText}>✓ Attendance Marked</Text>
        ) : (
          <TouchableOpacity style={styles.markButton} onPress={() => markAttendance(item.id)}>
            <Text style={styles.markButtonText}>Mark Attendance</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark Attendance</Text>
      {classes.length === 0 ? (
        <Text style={styles.noData}>No classes available.</Text>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderClassItem}
        />
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
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 3,
  },
  markedText: {
    marginTop: 10,
    color: colors.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  markButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  markButtonText: {
    color: '#FEFCFB',
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
    marginTop: 50,
  },
});