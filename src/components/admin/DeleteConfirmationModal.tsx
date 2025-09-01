// src/components/admin/DeleteConfirmationModal.tsx
'use client';

import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    itemName: string;
    itemType: string;
}

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isLoading, 
    itemName,
    itemType
}: DeleteModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete {itemType}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <strong>"{itemName}"</strong>? This action is irreversible.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        disabled={isLoading} 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isLoading} 
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;