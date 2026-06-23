import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
  type EmergencyContact,
} from '../../api/emergencyContacts.api';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppButton } from '../../components/ui/AppButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { EmptyState } from '../../components/shared/EmptyState';

export function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (error: any) {
      console.log('GET EMERGENCY CONTACTS ERROR:', error?.response?.data || error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, []),
  );

  const handleAddContact = async () => {
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanRelationship = relationship.trim();

    if (!cleanName || !cleanPhone) {
      Alert.alert('Missing details', 'Please enter name and phone number.');
      return;
    }

    try {
      setSaving(true);

      await createEmergencyContact({
        fullName: cleanName,
        phone: cleanPhone,
        relationship: cleanRelationship || undefined,
      });

      setFullName('');
      setPhone('');
      setRelationship('');
      await fetchContacts();
    } catch (error: any) {
      console.log('CREATE EMERGENCY CONTACT ERROR:', error?.response?.data || error);

      Alert.alert(
        'Could not save contact',
        error?.response?.data?.message || 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    Alert.alert(
      'Delete Emergency Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmergencyContact(contactId);
              await fetchContacts();
            } catch (error: any) {
              console.log('DELETE EMERGENCY CONTACT ERROR:', error?.response?.data || error);

              Alert.alert(
                'Delete Failed',
                error?.response?.data?.message || 'Could not delete contact.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <AppScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Emergency Contacts</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add Emergency Contact</Text>

          <TextInput
            placeholder="Full name"
            placeholderTextColor={colors.gray}
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone number"
            placeholderTextColor={colors.gray}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            placeholder="Relationship e.g. Brother, Friend"
            placeholderTextColor={colors.gray}
            value={relationship}
            onChangeText={setRelationship}
            style={styles.input}
          />

          <AppButton
            title="Save Contact"
            onPress={handleAddContact}
            loading={saving}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Contacts</Text>
          <Text style={styles.countText}>
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
          </Text>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!loading && contacts.length === 0 && (
          <EmptyState
            icon="phone"
            title="No emergency contacts yet"
            message="Add trusted people we can contact during emergencies."
          />
        )}

        {!loading &&
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <FontAwesome name="user" size={16} color={colors.white} />
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.fullName}</Text>
                <Text style={styles.contactMeta}>{contact.phone}</Text>

                {contact.relationship && (
                  <Text style={styles.contactMeta}>{contact.relationship}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteContact(contact.id)}
              >
                <FontAwesome name="trash" size={15} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.headingLarge,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  countText: {
    ...typography.caption,
    color: colors.gray,
  },
  center: {
    marginTop: spacing.xl,
  },
  contactCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.caption,
    color: colors.black,
  },
  contactMeta: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});