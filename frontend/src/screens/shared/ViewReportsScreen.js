import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

// Helper to handle fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

export default function ViewReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [editingFeedback, setEditingFeedback] = useState({});

  useEffect(() => {
    fetchUserRoleAndReports();
  }, []);

  const fetchUserRoleAndReports = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      setLoading(false);
      return;
    }

    try {
      // 1. Get user role from backend
      const roleResponse = await fetch(`${API_BASE}/users/${user.uid}`);
      const userData = await handleResponse(roleResponse);
      const role = userData.role;
      setUserRole(role);

      // 2. Fetch reports based on role and userId
      const reportsUrl = `${API_BASE}/reports?role=${role}&userId=${user.uid}`;
      const reportsResponse = await fetch(reportsUrl);
      const reportsData = await handleResponse(reportsResponse);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (reportId, text) => {
    setEditingFeedback(prev => ({ ...prev, [reportId]: text }));
  };

  const saveFeedback = async (reportId) => {
    const feedbackText = editingFeedback[reportId];
    if (!feedbackText || feedbackText.trim() === '') {
      Alert.alert('Error', 'Please enter feedback');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/reports/${reportId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prlFeedback: feedbackText.trim() })
      });
      await handleResponse(response);
      Alert.alert('Success', 'Feedback saved – report is now visible to PL');
      setReports(prevReports =>
        prevReports.map(r =>
          r.id === reportId ? { ...r, prlFeedback: feedbackText.trim(), reviewedByPRL: true } : r
        )
      );
      setEditingFeedback(prev => {
        const newState = { ...prev };
        delete newState[reportId];
        return newState;
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      Alert.alert('Error', 'Failed to save feedback: ' + error.message);
    }
  };

  const renderItem = ({ item }) => {
    const existingFeedback = item.prlFeedback || '';
    const isPrl = userRole === 'prl';
    const isLecturer = userRole === 'lecturer';
    const currentEdit = editingFeedback[item.id] !== undefined ? editingFeedback[item.id] : existingFeedback;

    return (
      <View style={styles.card}>
        <Text style={styles.course}>{item.courseNameCode}</Text>
        <Text style={styles.cardText}>Lecturer: {item.lecturerName}</Text>
        <Text style={styles.cardText}>Date: {item.date}</Text>
        <Text style={styles.cardText}>Topic: {item.topic}</Text>
        <Text style={styles.cardText}>Students Present: {item.studentsPresent}</Text>
        {item.recommendations && <Text style={styles.cardText}>Recommendations: {item.recommendations}</Text>}

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>PRL Feedback:</Text>
          {isPrl ? (
            <>
              <TextInput
                style={styles.feedbackInput}
                multiline
                value={currentEdit}
                onChangeText={(text) => handleFeedbackChange(item.id, text)}
                placeholder="Add your feedback here..."
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity style={styles.saveButton} onPress={() => saveFeedback(item.id)}>
                <Text style={styles.saveButtonText}> Save Feedback</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.feedbackText}>{existingFeedback || 'No feedback yet'}</Text>
          )}
          {isLecturer && existingFeedback && (
            <Text style={styles.infoNote}> PRL has reviewed this report.</Text>
          )}
          {userRole === 'pl' && existingFeedback && (
            <Text style={styles.infoNote}>Final report ready for monitoring.</Text>
          )}
        </View>
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
      <Text style={styles.title}>
        {userRole === 'pl' ? 'Forwarded Reports (with PRL feedback)' : 'Reports'}
      </Text>
      {reports.length === 0 ? (
        <Text style={styles.noReports}>No reports found.</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
    fontSize: 28,
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
  course: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  cardText: {
    color: '#FFFFFF',
    marginBottom: 3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  noReports: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 50,
  },
  feedbackSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  feedbackLabel: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  feedbackInput: {
    backgroundColor: colors.buttonBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    color: '#FFFFFF',
  },
  feedbackText: {
    fontStyle: 'italic',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  infoNote: {
    marginTop: 5,
    fontSize: 12,
    color: colors.success,
  },
  saveButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});