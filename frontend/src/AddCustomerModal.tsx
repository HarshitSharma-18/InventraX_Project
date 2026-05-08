import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, Loader2, IndianRupee } from 'lucide-react';
import { Customer } from './types';
import { API_BASE_URL } from './constants';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({ label, error, icon, className, ...props }, ref) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">
      {label} {props.required && <span className="text-error">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none ${icon ? 'pl-10' : ''} ${error ? 'ring-2 ring-error/50' : ''} ${className || ''}`}
        {...props}
      />
    </div>
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-error ml-1 flex items-center gap-1">
        <AlertCircle size={10} />{error}
      </motion.p>
    )}
  </div>
));
FormInput.displayName = 'FormInput';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSave: (customer: Customer) => void;
}

export function AddCustomerModal({ isOpen, onClose, customerToEdit, onSave }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    full_name: '', mobile_number: '', alternate_number: '', address: '', opening_balance: '', notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setFormData({
          full_name: customerToEdit.full_name || '',
          mobile_number: customerToEdit.mobile_number || '',
          alternate_number: customerToEdit.alternate_number || '',
          address: customerToEdit.address || '',
          opening_balance: '', // Not editable after creation typically
          notes: customerToEdit.notes || ''
        });
      } else {
        setFormData({ full_name: '', mobile_number: '', alternate_number: '', address: '', opening_balance: '', notes: '' });
      }
      setErrors({});
      setToast(null);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, customerToEdit]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.mobile_number.trim() || formData.mobile_number.trim().length < 10) newErrors.mobile_number = 'Valid 10-digit mobile number required';
    
    if (formData.opening_balance) {
      const amt = Number(formData.opening_balance);
      if (isNaN(amt) || amt < 0) {
        newErrors.opening_balance = 'Must be a valid positive amount';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    
    setIsSaving(true);
    setToast(null);

    try {
      const token = localStorage.getItem('inventrax_token');
      const isEdit = !!customerToEdit;
      const url = isEdit ? `${API_BASE_URL}/api/udhar/customers/${customerToEdit?.id}` : `${API_BASE_URL}/api/udhar/customers`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to save customer', type: 'error' });
        setIsSaving(false);
        return;
      }

      onSave(data);
      onClose();
    } catch (e) {
      setToast({ message: 'Network error occurred. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const setAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, opening_balance: amount.toString() }));
  };

  const getButtonText = () => {
    if (isSaving) return 'Saving...';
    if (customerToEdit) return 'Update Udhar Account';
    return 'Add Udhar';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-surface-container-lowest rounded-t-[2rem] z-[60] flex flex-col max-w-2xl mx-auto editorial-shadow overflow-hidden"
          >
            {/* Handle Bar */}
            <div className="w-full flex justify-center py-3 bg-surface-container-lowest shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-on-surface-variant/20" />
            </div>

            <div className="px-6 pb-4 flex items-center justify-between border-b border-on-surface-variant/10 shrink-0 bg-surface-container-lowest">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                {customerToEdit ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button onClick={onClose} className="p-2 bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors active:scale-95 text-on-surface-variant">
                <X size={20} />
              </button>
            </div>

            {toast && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${toast.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                {toast.message}
              </motion.div>
            )}

            <div className="p-6 overflow-y-auto no-scrollbar flex-grow pb-[120px]">
              <form id="customer-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
                
                {/* Initial Amount section (only on Create) */}
                {!customerToEdit && (
                  <div className="bg-secondary/5 border border-secondary/10 p-5 rounded-[2rem]">
                    <FormInput
                      label="Opening Balance / Pending Udhar"
                      type="number"
                      placeholder="0"
                      icon={<IndianRupee size={20} className="text-secondary" />}
                      value={formData.opening_balance}
                      onChange={e => setFormData({ ...formData, opening_balance: e.target.value })}
                      error={errors.opening_balance}
                      className="text-3xl font-headline font-black text-secondary !py-5"
                    />
                    
                    <div className="flex gap-2 mt-4">
                      {[100, 500, 1000, 2000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt)}
                          className="flex-1 py-2 bg-surface-container-high rounded-xl text-xs font-bold text-on-surface-variant active:scale-95 transition-transform"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <FormInput
                    ref={nameRef}
                    label="Customer Full Name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    error={errors.full_name}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Mobile Number"
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.mobile_number}
                      onChange={e => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '') })}
                      error={errors.mobile_number}
                      maxLength={10}
                    />
                    <FormInput
                      label="Alternate Mobile"
                      type="tel"
                      placeholder="Optional"
                      value={formData.alternate_number}
                      onChange={e => setFormData({ ...formData, alternate_number: e.target.value.replace(/\D/g, '') })}
                      maxLength={10}
                    />
                  </div>

                  <FormInput
                    label="Address"
                    placeholder="Shop 4, Main Market"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />

                  <FormInput
                    label="Notes"
                    placeholder="Any additional details..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </form>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest to-transparent border-t border-on-surface-variant/5">
              <button
                type="submit"
                form="customer-form"
                disabled={isSaving}
                className="w-full py-5 bg-primary text-white rounded-2xl font-headline font-bold flex items-center justify-center gap-2 ambient-glow active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-lg"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                <span className="text-lg">{getButtonText()}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
