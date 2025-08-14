// Emergency Contacts Management System

const contactsManager = {
    // Storage key for contacts
    storageKey: 'safeNepal_emergencyContacts',
    
    // Initialize contacts system
    init() {
        this.loadContacts();
        this.setupEventListeners();
    },
    
    // Set up event listeners for the contacts form and buttons
    setupEventListeners() {
        // Add contact form submission
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addContact();
            });
        }
        
        // Import contacts button
        const importBtn = document.getElementById('import-contacts');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importContacts());
        }
        
        // Export contacts button
        const exportBtn = document.getElementById('export-contacts');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportContacts());
        }
        
        // Share contacts button (if Web Share API is available)
        const shareBtn = document.getElementById('share-contacts');
        if (shareBtn && navigator.share) {
            shareBtn.classList.remove('d-none');
            shareBtn.addEventListener('click', () => this.shareContacts());
        }
        
        // Generate QR code button
        const qrBtn = document.getElementById('generate-qr');
        if (qrBtn) {
            qrBtn.addEventListener('click', () => this.generateQRCode());
        }
    },
    
    // Load contacts from local storage
    loadContacts() {
        const contactsList = document.getElementById('contacts-list');
        if (!contactsList) return;
        
        // Clear existing contacts
        contactsList.innerHTML = '';
        
        // Get contacts from storage
        const contacts = this.getContacts();
        
        if (contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-address-book fs-1 text-muted mb-3"></i>
                    <p>No emergency contacts added yet.</p>
                    <p class="small text-muted">Add important contacts to quickly reach them during emergencies.</p>
                </div>
            `;
            return;
        }
        
        // Add each contact to the list
        contacts.forEach((contact, index) => {
            const contactCard = this.createContactElement(contact, index);
            contactsList.appendChild(contactCard);
        });
    },
    
    // Create HTML element for a contact
    createContactElement(contact, index) {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'card mb-3 contact-card';
        contactDiv.setAttribute('data-index', index);
        
        // Determine the icon based on contact type
        let typeIcon = 'user';
        if (contact.type === 'family') typeIcon = 'house-user';
        if (contact.type === 'medical') typeIcon = 'hospital';
        if (contact.type === 'emergency') typeIcon = 'ambulance';
        if (contact.type === 'work') typeIcon = 'briefcase';
        
        contactDiv.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex">
                        <div class="icon-lg rounded-circle bg-primary-light text-primary me-3">
                            <i class="fas fa-${typeIcon}"></i>
                        </div>
                        <div>
                            <h5 class="card-title mb-1">${contact.name}</h5>
                            <p class="card-subtitle text-muted small mb-2">${contact.relationship || contact.type}</p>
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><button class="dropdown-item edit-contact" data-index="${index}"><i class="fas fa-edit me-2"></i>Edit</button></li>
                            <li><button class="dropdown-item delete-contact" data-index="${index}"><i class="fas fa-trash-alt me-2"></i>Delete</button></li>
                            <li><button class="dropdown-item share-contact" data-index="${index}"><i class="fas fa-share-alt me-2"></i>Share</button></li>
                        </ul>
                    </div>
                </div>
                
                <div class="contact-details mt-3">
                    <div class="d-flex mb-2">
                        <div class="contact-icon me-2">
                            <i class="fas fa-phone text-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                            <a href="tel:${contact.phone}" class="text-decoration-none">${contact.phone}</a>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-primary rounded-circle call-btn" data-phone="${contact.phone}" title="Call">
                                <i class="fas fa-phone-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${contact.email ? `
                    <div class="d-flex mb-2">
                        <div class="contact-icon me-2">
                            <i class="fas fa-envelope text-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                            <a href="mailto:${contact.email}" class="text-decoration-none">${contact.email}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${contact.address ? `
                    <div class="d-flex mb-2">
                        <div class="contact-icon me-2">
                            <i class="fas fa-map-marker-alt text-primary"></i>
                        </div>
                        <div>
                            ${contact.address}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${contact.notes ? `
                    <div class="d-flex mt-3 pt-2 border-top">
                        <div class="contact-icon me-2">
                            <i class="fas fa-sticky-note text-primary"></i>
                        </div>
                        <div>
                            <small>${contact.notes}</small>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners for the contact card buttons
        setTimeout(() => {
            // Edit button
            const editBtn = contactDiv.querySelector('.edit-contact');
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editContact(index));
            }
            
            // Delete button
            const deleteBtn = contactDiv.querySelector('.delete-contact');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteContact(index));
            }
            
            // Share button
            const shareBtn = contactDiv.querySelector('.share-contact');
            if (shareBtn) {
                shareBtn.addEventListener('click', () => this.shareContact(contact));
            }
            
            // Call button
            const callBtn = contactDiv.querySelector('.call-btn');
            if (callBtn) {
                callBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = `tel:${contact.phone}`;
                });
            }
        }, 0);
        
        return contactDiv;
    },
    
    // Get contacts from local storage
    getContacts() {
        const contactsJson = localStorage.getItem(this.storageKey);
        return contactsJson ? JSON.parse(contactsJson) : [];
    },
    
    // Save contacts to local storage
    saveContacts(contacts) {
        localStorage.setItem(this.storageKey, JSON.stringify(contacts));
        this.loadContacts(); // Refresh the display
    },
    
    // Add a new contact
    addContact() {
        const nameInput = document.getElementById('contact-name');
        const phoneInput = document.getElementById('contact-phone');
        const emailInput = document.getElementById('contact-email');
        const typeInput = document.getElementById('contact-type');
        const relationshipInput = document.getElementById('contact-relationship');
        const addressInput = document.getElementById('contact-address');
        const notesInput = document.getElementById('contact-notes');
        
        if (!nameInput || !phoneInput) return;
        
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        
        if (!name || !phone) {
            this.showAlert('Please enter a name and phone number', 'danger');
            return;
        }
        
        const newContact = {
            name,
            phone,
            email: emailInput ? emailInput.value.trim() : '',
            type: typeInput ? typeInput.value : 'personal',
            relationship: relationshipInput ? relationshipInput.value.trim() : '',
            address: addressInput ? addressInput.value.trim() : '',
            notes: notesInput ? notesInput.value.trim() : ''
        };
        
        const contacts = this.getContacts();
        contacts.push(newContact);
        this.saveContacts(contacts);
        
        // Reset form
        document.getElementById('contact-form').reset();
        
        // Show success message
        this.showAlert('Contact added successfully', 'success');
        
        // Close modal if it exists
        const modal = document.getElementById('add-contact-modal');
        if (modal && bootstrap.Modal.getInstance(modal)) {
            bootstrap.Modal.getInstance(modal).hide();
        }
    },
    
    // Edit a contact
    editContact(index) {
        const contacts = this.getContacts();
        const contact = contacts[index];
        
        if (!contact) return;
        
        // Populate the edit form
        const editForm = document.getElementById('edit-contact-form');
        if (!editForm) return;
        
        document.getElementById('edit-contact-name').value = contact.name;
        document.getElementById('edit-contact-phone').value = contact.phone;
        document.getElementById('edit-contact-email').value = contact.email || '';
        document.getElementById('edit-contact-type').value = contact.type || 'personal';
        document.getElementById('edit-contact-relationship').value = contact.relationship || '';
        document.getElementById('edit-contact-address').value = contact.address || '';
        document.getElementById('edit-contact-notes').value = contact.notes || '';
        
        // Set the index as a data attribute on the form
        editForm.setAttribute('data-index', index);
        
        // Show the edit modal
        const editModal = new bootstrap.Modal(document.getElementById('edit-contact-modal'));
        editModal.show();
        
        // Handle form submission
        editForm.onsubmit = (e) => {
            e.preventDefault();
            
            const updatedContact = {
                name: document.getElementById('edit-contact-name').value.trim(),
                phone: document.getElementById('edit-contact-phone').value.trim(),
                email: document.getElementById('edit-contact-email').value.trim(),
                type: document.getElementById('edit-contact-type').value,
                relationship: document.getElementById('edit-contact-relationship').value.trim(),
                address: document.getElementById('edit-contact-address').value.trim(),
                notes: document.getElementById('edit-contact-notes').value.trim()
            };
            
            if (!updatedContact.name || !updatedContact.phone) {
                this.showAlert('Please enter a name and phone number', 'danger', 'edit-alert');
                return;
            }
            
            contacts[index] = updatedContact;
            this.saveContacts(contacts);
            
            // Hide the modal
            editModal.hide();
            
            // Show success message
            this.showAlert('Contact updated successfully', 'success');
        };
    },
    
    // Delete a contact
    deleteContact(index) {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        
        const contacts = this.getContacts();
        contacts.splice(index, 1);
        this.saveContacts(contacts);
        
        this.showAlert('Contact deleted', 'success');
    },
    
    // Share a contact
    shareContact(contact) {
        if (!contact) return;
        
        // Create vCard format
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${contact.phone}
${contact.email ? `EMAIL:${contact.email}\n` : ''}${contact.address ? `ADR:;;${contact.address};;;\n` : ''}END:VCARD`;
        
        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: `Contact: ${contact.name}`,
                text: `Name: ${contact.name}\nPhone: ${contact.phone}${contact.email ? `\nEmail: ${contact.email}` : ''}`,
                url: 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcard)
            }).catch(err => {
                console.error('Share failed:', err);
                this.fallbackShare(contact, vcard);
            });
        } else {
            this.fallbackShare(contact, vcard);
        }
    },
    
    // Fallback sharing method
    fallbackShare(contact, vcard) {
        // Create a temporary textarea to copy the contact info
        const textarea = document.createElement('textarea');
        textarea.value = `Name: ${contact.name}\nPhone: ${contact.phone}${contact.email ? `\nEmail: ${contact.email}` : ''}${contact.address ? `\nAddress: ${contact.address}` : ''}`;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        this.showAlert('Contact information copied to clipboard', 'success');
    },
    
    // Import contacts from file
    importContacts() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.vcf';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    if (file.name.endsWith('.json')) {
                        // Import JSON format
                        const importedContacts = JSON.parse(event.target.result);
                        if (Array.isArray(importedContacts)) {
                            const contacts = this.getContacts();
                            const newContacts = [...contacts, ...importedContacts];
                            this.saveContacts(newContacts);
                            this.showAlert(`Imported ${importedContacts.length} contacts`, 'success');
                        } else {
                            throw new Error('Invalid format');
                        }
                    } else if (file.name.endsWith('.vcf')) {
                        // Import vCard format (basic implementation)
                        const vcardContent = event.target.result;
                        const vcards = vcardContent.split('BEGIN:VCARD');
                        
                        let importCount = 0;
                        const contacts = this.getContacts();
                        
                        vcards.forEach(vcard => {
                            if (!vcard.trim()) return;
                            
                            // Simple parsing of vCard format
                            const nameMatch = vcard.match(/FN:(.+)/);
                            const phoneMatch = vcard.match(/TEL[^:]*:(.+)/);
                            const emailMatch = vcard.match(/EMAIL[^:]*:(.+)/);
                            const addressMatch = vcard.match(/ADR[^:]*:(.+)/);
                            
                            if (nameMatch && phoneMatch) {
                                const newContact = {
                                    name: nameMatch[1].trim(),
                                    phone: phoneMatch[1].trim(),
                                    type: 'personal'
                                };
                                
                                if (emailMatch) newContact.email = emailMatch[1].trim();
                                if (addressMatch) newContact.address = addressMatch[1].replace(/;/g, ' ').trim();
                                
                                contacts.push(newContact);
                                importCount++;
                            }
                        });
                        
                        if (importCount > 0) {
                            this.saveContacts(contacts);
                            this.showAlert(`Imported ${importCount} contacts`, 'success');
                        } else {
                            this.showAlert('No valid contacts found in file', 'warning');
                        }
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    this.showAlert('Error importing contacts. Please check the file format.', 'danger');
                }
            };
            
            reader.readAsText(file);
        };
        
        fileInput.click();
    },
    
    // Export contacts to file
    exportContacts() {
        const contacts = this.getContacts();
        if (contacts.length === 0) {
            this.showAlert('No contacts to export', 'warning');
            return;
        }
        
        // Create JSON file
        const dataStr = JSON.stringify(contacts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        // Create download link
        const exportName = 'safeNepal_contacts_' + new Date().toISOString().slice(0, 10) + '.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
        
        this.showAlert('Contacts exported successfully', 'success');
    },
    
    // Share all contacts
    shareContacts() {
        const contacts = this.getContacts();
        if (contacts.length === 0) {
            this.showAlert('No contacts to share', 'warning');
            return;
        }
        
        // Create a text representation of all contacts
        let contactsText = 'SafeNepal Emergency Contacts\n\n';
        contacts.forEach(contact => {
            contactsText += `Name: ${contact.name}\n`;
            contactsText += `Phone: ${contact.phone}\n`;
            if (contact.email) contactsText += `Email: ${contact.email}\n`;
            if (contact.address) contactsText += `Address: ${contact.address}\n`;
            contactsText += '\n';
        });
        
        // Try to use Web Share API
        if (navigator.share) {
            navigator.share({
                title: 'SafeNepal Emergency Contacts',
                text: contactsText
            }).catch(err => {
                console.error('Share failed:', err);
                
                // Fallback: copy to clipboard
                const textarea = document.createElement('textarea');
                textarea.value = contactsText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                this.showAlert('Contacts copied to clipboard', 'success');
            });
        } else {
            // Fallback: copy to clipboard
            const textarea = document.createElement('textarea');
            textarea.value = contactsText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            this.showAlert('Contacts copied to clipboard', 'success');
        }
    },
    
    // Generate QR code for contacts
    generateQRCode() {
        const contacts = this.getContacts();
        if (contacts.length === 0) {
            this.showAlert('No contacts to share', 'warning');
            return;
        }
        
        // Create a modal to display the QR code
        const modalHtml = `
            <div class="modal fade" id="qr-code-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Emergency Contacts QR Code</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div id="qr-code-container" class="my-3"></div>
                            <p class="text-muted small">Scan this QR code to access your emergency contacts</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="download-qr">Download</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add the modal to the document if it doesn't exist
        if (!document.getElementById('qr-code-modal')) {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
        }
        
        // Create a data URL for the contacts
        const contactsData = JSON.stringify(contacts);
        const dataUrl = `https://safenepal.example.com/contacts?data=${encodeURIComponent(contactsData)}`;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('qr-code-modal'));
        modal.show();
        
        // Generate the QR code
        // Note: This requires a QR code library like qrcode.js
        // For this example, we'll just show a placeholder
        const qrContainer = document.getElementById('qr-code-container');
        qrContainer.innerHTML = `
            <div class="bg-light p-4 rounded">
                <i class="fas fa-qrcode fa-5x text-primary"></i>
                <p class="mt-3">QR Code Placeholder</p>
                <p class="small text-muted">In a real implementation, this would be an actual QR code generated with a library like qrcode.js</p>
            </div>
        `;
        
        // Handle download button
        document.getElementById('download-qr').addEventListener('click', () => {
            // In a real implementation, this would download the QR code image
            this.showAlert('QR code download functionality would be implemented here', 'info');
        });
    },
    
    // Show alert message
    showAlert(message, type, containerId = 'alert-container') {
        const alertContainer = document.getElementById(containerId);
        if (!alertContainer) return;
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }
};

// Initialize contacts system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    contactsManager.init();
});