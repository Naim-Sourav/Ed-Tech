
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaymentRequest } from '../types';
import { 
  submitPaymentToAPI, 
  fetchPaymentsFromAPI, 
  updatePaymentStatusAPI, 
  deletePaymentAPI, 
  sendNotificationAPI,
  fetchAdminStatsAPI 
} from '../services/api';
import { useAuth } from './AuthContext';
import { isAdminEmail } from '../utils/adminConfig';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AdminStats {
  totalRevenue: number;
  totalEnrollments: number;
  pendingRequests: number;
  activeUsers: number;
  totalQuestions: number;
  totalExams: number; 
}

interface AdminContextType {
  paymentRequests: PaymentRequest[];
  stats: AdminStats;
  submitPaymentRequest: (request: Omit<PaymentRequest, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  approvePayment: (id: string) => Promise<void>;
  rejectPayment: (id: string) => Promise<void>;
  deletePaymentRequest: (id: string) => Promise<void>;
  sendNotification: (title: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS', sendPush?: boolean) => Promise<void>;
  isAdmin: boolean;
  refreshRequests: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};

// Admin e-mails live in utils/adminConfig.ts (single source of truth).
// NOTE: this only gates the UI — firestore.rules + backend must enforce it too.

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalEnrollments: 0,
    pendingRequests: 0,
    activeUsers: 0,
    totalQuestions: 0,
    totalExams: 0
  });
  
  // Dynamic Admin Check (UI gating only — server-side rules enforce the rest)
  const isAdmin = isAdminEmail(currentUser?.email);

  const refreshRequests = async () => {
    // Prevent non-admins from fetching sensitive data
    if (!isAdmin) return;

    try {
      const [requests, fetchedStats] = await Promise.all([
          fetchPaymentsFromAPI(),
          fetchAdminStatsAPI()
      ]);
      
      setPaymentRequests(requests);
      
      if (fetchedStats) {
          setStats({
              totalRevenue: fetchedStats.totalRevenue,
              totalEnrollments: fetchedStats.approvedEnrollments,
              pendingRequests: fetchedStats.pendingPayments,
              activeUsers: fetchedStats.totalUsers,
              totalQuestions: fetchedStats.totalQuestions,
              totalExams: fetchedStats.totalExams
          });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
        refreshRequests();
    }
  }, [isAdmin]);

  const submitPaymentRequest = async (requestData: Omit<PaymentRequest, 'id' | 'status' | 'timestamp'>) => {
    try {
      await submitPaymentToAPI(requestData);
      // Only refresh if the submitter is also an admin (testing purpose), otherwise user doesn't need admin data
      if (isAdmin) await refreshRequests(); 
    } catch (e) {
      console.error("Error submitting payment:", e);
      throw e;
    }
  };

  const approvePayment = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updatePaymentStatusAPI(id, 'APPROVED');
      await refreshRequests();
    } catch (e) {
      console.error("Error approving:", e);
      alert("Failed to approve payment.");
    }
  };

  const rejectPayment = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updatePaymentStatusAPI(id, 'REJECTED');
      await refreshRequests();
    } catch (e) {
      console.error("Error rejecting:", e);
    }
  };

  const deletePaymentRequest = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deletePaymentAPI(id);
      await refreshRequests();
    } catch (e) {
      console.error("Error deleting:", e);
    }
  };

  const sendNotification = async (title: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS', sendPush?: boolean) => {
    if (!isAdmin) return;
    try {
      // 1. Send to MongoDB (In-app notification)
      await sendNotificationAPI({ title, message, type, sendPush });
      
      // 2. If sendPush is true, also write to Firestore 'push_notifications'
      // This can be used by a Cloud Function to actually send the FCM message
      if (sendPush) {
        await addDoc(collection(db, 'push_notifications'), {
          title,
          body: message,
          type,
          status: 'PENDING',
          createdAt: serverTimestamp(),
          sentBy: currentUser?.uid
        });
      }
    } catch (e) {
      console.error("Error sending notification:", e);
      throw e;
    }
  };

  return (
    <AdminContext.Provider value={{ 
      paymentRequests, 
      stats,
      submitPaymentRequest, 
      approvePayment, 
      rejectPayment, 
      deletePaymentRequest,
      sendNotification,
      isAdmin, 
      refreshRequests 
    }}>
      {children}
    </AdminContext.Provider>
  );
};
