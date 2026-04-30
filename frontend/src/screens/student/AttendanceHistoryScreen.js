import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

// Helper to convert Firestore timestamp to readable date string
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  if (timestamp instanceof Date) return timestamp.toLocaleString();
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

export default function AttendanceHistoryScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      // 1. Fetch attendance records for this student
      const attendanceRes = await fetch(`${API_BASE}/attendance/${user.uid}`);
      const attendanceData = await attendanceRes.json();

      // 2. For each record, fetch class details
      const recordsWithClass = [];
      for (const record of attendanceData) {
        try {
          const classRes = await fetch(`${API_BASE}/classes/${record.classId}`);
          if (classRes.ok) {
            const classData = await classRes.json();
            recordsWithClass.push({
              id: record.id,
              classId: record.classId,
              markedAt: record.markedAt,
              courseName: classData.courseName,
              courseCode: classData.courseCode,
              topic: classData.topic,
              date: classData.date,
              classNameGroup: classData.className,
            });
          } else {
            // Fallback if class not found
            recordsWithClass.push({
              id: record.id,
              classId: record.classId,
              markedAt: record.markedAt,
              courseName: 'Unknown Course',
              courseCode: 'N/A',
              topic: 'N/A',
              date: 'N/A',
              classNameGroup: 'N/A',
            });
          }
        } catch (err) {
          console.error('Error fetching class:', record.classId, err);
          recordsWithClass.push({
            id: record.id,
            classId: record.classId,
            markedAt: record.markedAt,
            courseName: 'Error loading course',
            courseCode: 'N/A',
            topic: 'N/A',
            date: 'N/A',
            classNameGroup: 'N/A',
          });
        }
      }
      setAttendanceRecords(recordsWithClass);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.courseTitle}>{item.courseName} ({item.courseCode})</Text>
      <Text style={styles.detail}>Class Group: {item.classNameGroup}</Text>
      <Text style={styles.detail}>Topic: {item.topic}</Text>
      <Text style={styles.detail}>Date: {item.date}</Text>
      <Text style={styles.markedAt}>Marked on: {formatTimestamp(item.markedAt)}</Text>
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
      <Text style={styles.title}>My Attendance History</Text>
      {attendanceRecords.length === 0 ? (
        <Text style={styles.noData}>You haven't marked any attendance yet.</Text>
      ) : (
        <FlatList
          data={attendanceRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    fontSize: 24,
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
  detail: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  markedAt: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
    fontStyle: 'italic',
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