// Community Reports Module for SafeNepal

const communityReportsManager = {
    // Reports data
    reports: [],
    
    // User data
    userData: {
        username: '',
        location: '',
        trusted: false,
        reportCount: 0
    },
    
    // Report categories
    categories: [
        { id: 'earthquake', name: 'Earthquake', icon: 'fa-house-crack' },
        { id: 'flood', name: 'Flood', icon: 'fa-water' },
        { id: 'landslide', name: 'Landslide', icon: 'fa-mountain' },
        { id: 'fire', name: 'Fire', icon: 'fa-fire' },
        { id: 'road', name: 'Road Blockage', icon: 'fa-road' },
        { id: 'infrastructure', name: 'Infrastructure Damage', icon: 'fa-building-circle-exclamation' },
        { id: 'medical', name: 'Medical Emergency', icon: 'fa-kit-medical' },
        { id: 'other', name: 'Other', icon: 'fa-triangle-exclamation' }
    ],
    
    // Severity levels
    severityLevels: [
        { id: 'low', name: 'Low', color: 'success' },
        { id: 'medium', name: 'Medium', color: 'warning' },
        { id: 'high', name: 'High', color: 'danger' },
        { id: 'critical', name: 'Critical', color: 'dark' }
    ],
    
    // Initialize community reports
    init() {
        // Load reports from localStorage or server
        this.loadReports();
        
        // Load user data
        this.loadUserData();
        
        // Set up UI
        this.setupUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for geolocation permission
        this.checkGeolocationPermission();
    },
    
    // Load reports from localStorage or server
    loadReports() {
        // Try to load from localStorage first
        const savedReports = localStorage.getItem('safeNepal_communityReports');
        if (savedReports) {
            try {
                this.reports = JSON.parse(savedReports);
                console.log(`Loaded ${this.reports.length} reports from localStorage`);
            } catch (e) {
                console.error('Error parsing community reports:', e);
                this.reports = [];
            }
        } else {
            // If no reports in localStorage, try to fetch from server
            this.fetchReportsFromServer();
        }
    },
    
    // Fetch reports from server
    fetchReportsFromServer() {
        // In a real application, this would make an API call to fetch reports
        // For this demo, we'll use sample data
        this.reports = this.getSampleReports();
        console.log(`Loaded ${this.reports.length} sample reports`);
        
        // Save to localStorage
        this.saveReports();
    },
    
    // Save reports to localStorage
    saveReports() {
        localStorage.setItem('safeNepal_communityReports', JSON.stringify(this.reports));
    },
    
    // Load user data from localStorage
    loadUserData() {
        const savedUserData = localStorage.getItem('safeNepal_userData');
        if (savedUserData) {
            try {
                this.userData = JSON.parse(savedUserData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    },
    
    // Save user data to localStorage
    saveUserData() {
        localStorage.setItem('safeNepal_userData', JSON.stringify(this.userData));
    },
    
    // Set up UI elements
    setupUI() {
        // Update user profile section
        this.updateUserProfile();
        
        // Render report form
        this.renderReportForm();
        
        // Render reports list
        this.renderReportsList();
        
        // Render reports map
        this.renderReportsMap();
    },
    
    // Update user profile section
    updateUserProfile() {
        const userProfileContainer = document.getElementById('user-profile');
        if (!userProfileContainer) return;
        
        if (this.userData.username) {
            // User is logged in
            userProfileContainer.innerHTML = `
                <div class="card border-primary mb-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="avatar bg-primary text-white me-3">
                                ${this.getInitials(this.userData.username)}
                            </div>
                            <div>
                                <h5 class="mb-0">${this.userData.username}</h5>
                                <p class="text-muted mb-0">
                                    <i class="fas fa-map-marker-alt me-1"></i> ${this.userData.location || 'Location not set'}
                                </p>
                            </div>
                            <div class="ms-auto">
                                ${this.userData.trusted ? '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i> Trusted Reporter</span>' : ''}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <div>
                                <small class="text-muted">Reports submitted: ${this.userData.reportCount}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" id="edit-profile-btn">
                                <i class="fas fa-edit me-1"></i> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // User is not logged in
            userProfileContainer.innerHTML = `
                <div class="card border-primary mb-4">
                    <div class="card-body">
                        <p class="mb-3">Set up your profile to submit community reports.</p>
                        <button class="btn btn-primary" id="setup-profile-btn">
                            <i class="fas fa-user-plus me-1"></i> Set Up Profile
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Add event listeners
        const setupProfileBtn = document.getElementById('setup-profile-btn');
        if (setupProfileBtn) {
            setupProfileBtn.addEventListener('click', () => this.showProfileModal());
        }
        
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showProfileModal());
        }
    },
    
    // Show profile modal
    showProfileModal() {
        // Check if modal container exists
        let modalContainer = document.getElementById('profile-modal-container');
        if (!modalContainer) {
            // Create modal container
            modalContainer = document.createElement('div');
            modalContainer.id = 'profile-modal-container';
            document.body.appendChild(modalContainer);
        }
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="profileModalLabel">
                                ${this.userData.username ? 'Edit Profile' : 'Set Up Profile'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="profile-form">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Display Name</label>
                                    <input type="text" class="form-control" id="username" value="${this.userData.username || ''}" required>
                                    <div class="form-text">This name will be visible with your reports.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="location" class="form-label">Location</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="location" value="${this.userData.location || ''}" placeholder="e.g., Kathmandu, Nepal">
                                        <button class="btn btn-outline-secondary" type="button" id="detect-location-btn">
                                            <i class="fas fa-map-marker-alt"></i>
                                        </button>
                                    </div>
                                    <div class="form-text">Your general location helps contextualize your reports.</div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="terms-checkbox" required>
                                    <label class="form-check-label" for="terms-checkbox">
                                        I agree to submit accurate reports and understand that false reporting may result in account restrictions.
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-profile-btn">
                                <i class="fas fa-save me-1"></i> Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize Bootstrap modal
        const modal = new bootstrap.Modal(document.getElementById('profileModal'));
        modal.show();
        
        // Add event listener to detect location button
        const detectLocationBtn = document.getElementById('detect-location-btn');
        if (detectLocationBtn) {
            detectLocationBtn.addEventListener('click', () => this.detectUserLocation());
        }
        
        // Add event listener to save profile button
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                const form = document.getElementById('profile-form');
                if (form.checkValidity()) {
                    const username = document.getElementById('username').value;
                    const location = document.getElementById('location').value;
                    
                    // Update user data
                    this.userData.username = username;
                    this.userData.location = location;
                    
                    // Save user data
                    this.saveUserData();
                    
                    // Update UI
                    this.updateUserProfile();
                    
                    // Close modal
                    modal.hide();
                    
                    // Show success message
                    this.showAlert('Profile saved successfully!', 'success');
                } else {
                    form.reportValidity();
                }
            });
        }
    },
    
    // Detect user location
    detectUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Get location name from coordinates using reverse geocoding
                    this.reverseGeocode(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.showAlert('Could not detect your location. Please enter it manually.', 'danger');
                }
            );
        } else {
            this.showAlert('Geolocation is not supported by your browser. Please enter your location manually.', 'warning');
        }
    },
    
    // Reverse geocode coordinates to get location name
    reverseGeocode(latitude, longitude) {
        // In a real application, this would make an API call to a geocoding service
        // For this demo, we'll simulate a response
        setTimeout(() => {
            // Simulate a location based on coordinates
            let location = 'Kathmandu, Nepal';
            
            // Update location input
            const locationInput = document.getElementById('location');
            if (locationInput) {
                locationInput.value = location;
            }
            
            // Show success message
            this.showAlert('Location detected successfully!', 'success');
        }, 1000);
    },
    
    // Check geolocation permission
    checkGeolocationPermission() {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'granted') {
                    // Permission already granted
                    console.log('Geolocation permission already granted');
                } else if (result.state === 'prompt') {
                    // Will be prompted for permission when needed
                    console.log('User will be prompted for geolocation permission');
                } else if (result.state === 'denied') {
                    // Permission denied
                    console.log('Geolocation permission denied');
                    this.showAlert('Location access is denied. Some features may not work properly.', 'warning', 10000);
                }
            });
        }
    },
    
    // Render report form
    renderReportForm() {
        const reportFormContainer = document.getElementById('report-form-container');
        if (!reportFormContainer) return;
        
        reportFormContainer.innerHTML = `
            <div class="card border-primary mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-bullhorn me-2"></i> Submit a Report</h5>
                </div>
                <div class="card-body">
                    <form id="community-report-form">
                        <div class="mb-3">
                            <label for="report-title" class="form-label">Report Title</label>
                            <input type="text" class="form-control" id="report-title" placeholder="Brief description of the situation" required>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="report-category" class="form-label">Category</label>
                                <select class="form-select" id="report-category" required>
                                    <option value="" selected disabled>Select category</option>
                                    ${this.categories.map(category => `
                                        <option value="${category.id}">${category.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="report-severity" class="form-label">Severity</label>
                                <select class="form-select" id="report-severity" required>
                                    <option value="" selected disabled>Select severity</option>
                                    ${this.severityLevels.map(level => `
                                        <option value="${level.id}">${level.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="report-description" class="form-label">Description</label>
                            <textarea class="form-control" id="report-description" rows="3" placeholder="Provide details about what you observed" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="report-location" class="form-label">Location</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="report-location" placeholder="Where is this happening?" required>
                                <button class="btn btn-outline-secondary" type="button" id="report-detect-location-btn">
                                    <i class="fas fa-map-marker-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="report-image" class="form-label">Image (optional)</label>
                            <input class="form-control" type="file" id="report-image" accept="image/*">
                        </div>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="report-anonymous">
                            <label class="form-check-label" for="report-anonymous">
                                Submit anonymously
                            </label>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary" ${!this.userData.username ? 'disabled' : ''}>
                                <i class="fas fa-paper-plane me-1"></i> Submit Report
                            </button>
                            ${!this.userData.username ? '<div class="form-text text-center mt-2">You need to set up your profile before submitting reports.</div>' : ''}
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add event listeners
        const reportForm = document.getElementById('community-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReport();
            });
        }
        
        const reportDetectLocationBtn = document.getElementById('report-detect-location-btn');
        if (reportDetectLocationBtn) {
            reportDetectLocationBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            // Get location name from coordinates
                            this.reverseGeocodeForReport(position.coords.latitude, position.coords.longitude);
                        },
                        (error) => {
                            console.error('Error getting location:', error);
                            this.showAlert('Could not detect your location. Please enter it manually.', 'danger');
                        }
                    );
                } else {
                    this.showAlert('Geolocation is not supported by your browser. Please enter your location manually.', 'warning');
                }
            });
        }
    },
    
    // Reverse geocode coordinates for report location
    reverseGeocodeForReport(latitude, longitude) {
        // In a real application, this would make an API call to a geocoding service
        // For this demo, we'll simulate a response
        setTimeout(() => {
            // Simulate a location based on coordinates
            let location = 'Thamel, Kathmandu, Nepal';
            
            // Update location input
            const locationInput = document.getElementById('report-location');
            if (locationInput) {
                locationInput.value = location;
            }
            
            // Store coordinates for later use
            this.reportCoordinates = {
                latitude,
                longitude
            };
            
            // Show success message
            this.showAlert('Location detected successfully!', 'success');
        }, 1000);
    },
    
    // Submit report
    submitReport() {
        // Get form values
        const title = document.getElementById('report-title').value;
        const categoryId = document.getElementById('report-category').value;
        const severityId = document.getElementById('report-severity').value;
        const description = document.getElementById('report-description').value;
        const location = document.getElementById('report-location').value;
        const anonymous = document.getElementById('report-anonymous').checked;
        
        // Get category and severity objects
        const category = this.categories.find(cat => cat.id === categoryId);
        const severity = this.severityLevels.find(level => level.id === severityId);
        
        // Create report object
        const report = {
            id: Date.now().toString(),
            title,
            category: categoryId,
            categoryName: category.name,
            categoryIcon: category.icon,
            severity: severityId,
            severityName: severity.name,
            severityColor: severity.color,
            description,
            location,
            coordinates: this.reportCoordinates || null,
            timestamp: new Date().toISOString(),
            user: anonymous ? null : this.userData.username,
            verified: false,
            upvotes: 0,
            downvotes: 0,
            comments: []
        };
        
        // Add report to reports array
        this.reports.unshift(report);
        
        // Update user report count
        this.userData.reportCount++;
        
        // Save reports and user data
        this.saveReports();
        this.saveUserData();
        
        // Reset form
        document.getElementById('community-report-form').reset();
        this.reportCoordinates = null;
        
        // Update UI
        this.renderReportsList();
        this.updateUserProfile();
        this.renderReportsMap();
        
        // Show success message
        this.showAlert('Your report has been submitted successfully!', 'success');
        
        // Trigger report submitted event
        const event = new CustomEvent('report_submitted', { detail: { report } });
        document.dispatchEvent(event);
    },
    
    // Render reports list
    renderReportsList() {
        const reportsListContainer = document.getElementById('reports-list-container');
        if (!reportsListContainer) return;
        
        // Check if there are any reports
        if (this.reports.length === 0) {
            reportsListContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> No reports have been submitted yet. Be the first to report an incident!
                </div>
            `;
            return;
        }
        
        // Create filter controls
        const filterControls = `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="mb-0">Filter Reports</h5>
                    <button class="btn btn-sm btn-outline-secondary" id="clear-filters-btn">
                        <i class="fas fa-times me-1"></i> Clear Filters
                    </button>
                </div>
                <div class="row g-2">
                    <div class="col-md-4">
                        <select class="form-select form-select-sm" id="filter-category">
                            <option value="">All Categories</option>
                            ${this.categories.map(category => `
                                <option value="${category.id}">${category.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select form-select-sm" id="filter-severity">
                            <option value="">All Severities</option>
                            ${this.severityLevels.map(level => `
                                <option value="${level.id}">${level.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select form-select-sm" id="filter-time">
                            <option value="">All Time</option>
                            <option value="1">Last 24 Hours</option>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Create reports list
        const reportsList = this.reports.map(report => {
            // Format timestamp
            const timestamp = new Date(report.timestamp);
            const timeAgo = this.getTimeAgo(timestamp);
            
            return `
                <div class="card mb-3 report-card" data-id="${report.id}" data-category="${report.category}" data-severity="${report.severity}" data-timestamp="${report.timestamp}">
                    <div class="card-header bg-${report.severityColor} bg-opacity-25 d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-${report.severityColor} me-2">${report.severityName}</span>
                            <span class="badge bg-secondary">
                                <i class="fas ${report.categoryIcon} me-1"></i> ${report.categoryName}
                            </span>
                        </div>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${report.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i> ${report.location}
                        </h6>
                        <p class="card-text">${report.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted">
                                    Reported by: ${report.user ? report.user : 'Anonymous'}
                                </small>
                                ${report.verified ? '<span class="badge bg-success ms-2"><i class="fas fa-check-circle me-1"></i> Verified</span>' : ''}
                            </div>
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-outline-primary upvote-btn" data-id="${report.id}">
                                    <i class="fas fa-thumbs-up me-1"></i> ${report.upvotes}
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger downvote-btn" data-id="${report.id}">
                                    <i class="fas fa-thumbs-down me-1"></i> ${report.downvotes}
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-secondary comment-btn" data-id="${report.id}">
                                    <i class="fas fa-comment me-1"></i> ${report.comments.length}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update container
        reportsListContainer.innerHTML = `
            ${filterControls}
            <div id="reports-list">
                ${reportsList}
            </div>
        `;
        
        // Add event listeners to filter controls
        const filterCategory = document.getElementById('filter-category');
        const filterSeverity = document.getElementById('filter-severity');
        const filterTime = document.getElementById('filter-time');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        
        if (filterCategory && filterSeverity && filterTime) {
            const applyFilters = () => {
                const categoryValue = filterCategory.value;
                const severityValue = filterSeverity.value;
                const timeValue = filterTime.value;
                
                const reportCards = document.querySelectorAll('.report-card');
                reportCards.forEach(card => {
                    let show = true;
                    
                    // Apply category filter
                    if (categoryValue && card.dataset.category !== categoryValue) {
                        show = false;
                    }
                    
                    // Apply severity filter
                    if (severityValue && card.dataset.severity !== severityValue) {
                        show = false;
                    }
                    
                    // Apply time filter
                    if (timeValue) {
                        const reportDate = new Date(card.dataset.timestamp);
                        const now = new Date();
                        const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
                        
                        if (daysDiff > parseInt(timeValue)) {
                            show = false;
                        }
                    }
                    
                    // Show or hide card
                    card.style.display = show ? 'block' : 'none';
                });
            };
            
            filterCategory.addEventListener('change', applyFilters);
            filterSeverity.addEventListener('change', applyFilters);
            filterTime.addEventListener('change', applyFilters);
            
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', () => {
                    filterCategory.value = '';
                    filterSeverity.value = '';
                    filterTime.value = '';
                    
                    const reportCards = document.querySelectorAll('.report-card');
                    reportCards.forEach(card => {
                        card.style.display = 'block';
                    });
                });
            }
        }
        
        // Add event listeners to report cards
        const upvoteButtons = document.querySelectorAll('.upvote-btn');
        const downvoteButtons = document.querySelectorAll('.downvote-btn');
        const commentButtons = document.querySelectorAll('.comment-btn');
        
        upvoteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reportId = button.dataset.id;
                this.upvoteReport(reportId);
            });
        });
        
        downvoteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reportId = button.dataset.id;
                this.downvoteReport(reportId);
            });
        });
        
        commentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reportId = button.dataset.id;
                this.showCommentModal(reportId);
            });
        });
    },
    
    // Upvote a report
    upvoteReport(reportId) {
        // Find report
        const reportIndex = this.reports.findIndex(report => report.id === reportId);
        if (reportIndex === -1) return;
        
        // Increment upvotes
        this.reports[reportIndex].upvotes++;
        
        // Save reports
        this.saveReports();
        
        // Update UI
        const upvoteButton = document.querySelector(`.upvote-btn[data-id="${reportId}"]`);
        if (upvoteButton) {
            upvoteButton.innerHTML = `<i class="fas fa-thumbs-up me-1"></i> ${this.reports[reportIndex].upvotes}`;
        }
    },
    
    // Downvote a report
    downvoteReport(reportId) {
        // Find report
        const reportIndex = this.reports.findIndex(report => report.id === reportId);
        if (reportIndex === -1) return;
        
        // Increment downvotes
        this.reports[reportIndex].downvotes++;
        
        // Save reports
        this.saveReports();
        
        // Update UI
        const downvoteButton = document.querySelector(`.downvote-btn[data-id="${reportId}"]`);
        if (downvoteButton) {
            downvoteButton.innerHTML = `<i class="fas fa-thumbs-down me-1"></i> ${this.reports[reportIndex].downvotes}`;
        }
    },
    
    // Show comment modal
    showCommentModal(reportId) {
        // Find report
        const report = this.reports.find(report => report.id === reportId);
        if (!report) return;
        
        // Check if modal container exists
        let modalContainer = document.getElementById('comment-modal-container');
        if (!modalContainer) {
            // Create modal container
            modalContainer = document.createElement('div');
            modalContainer.id = 'comment-modal-container';
            document.body.appendChild(modalContainer);
        }
        
        // Format comments
        const commentsHtml = report.comments.length > 0 ?
            report.comments.map(comment => {
                const commentTime = new Date(comment.timestamp);
                const timeAgo = this.getTimeAgo(commentTime);
                
                return `
                    <div class="comment mb-3">
                        <div class="d-flex justify-content-between">
                            <strong>${comment.user || 'Anonymous'}</strong>
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                        <p class="mb-0">${comment.text}</p>
                    </div>
                `;
            }).join('') :
            '<p class="text-muted">No comments yet. Be the first to comment!</p>';
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="modal fade" id="commentModal" tabindex="-1" aria-labelledby="commentModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="commentModalLabel">Comments</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="report-summary mb-3">
                                <h6>${report.title}</h6>
                                <p class="text-muted mb-0">
                                    <i class="fas fa-map-marker-alt me-1"></i> ${report.location}
                                </p>
                            </div>
                            <hr>
                            <div class="comments-container mb-3">
                                ${commentsHtml}
                            </div>
                            <form id="comment-form">
                                <div class="mb-3">
                                    <label for="comment-text" class="form-label">Add a Comment</label>
                                    <textarea class="form-control" id="comment-text" rows="2" required></textarea>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="comment-anonymous">
                                    <label class="form-check-label" for="comment-anonymous">
                                        Comment anonymously
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-primary" ${!this.userData.username ? 'disabled' : ''}>
                                    <i class="fas fa-paper-plane me-1"></i> Post Comment
                                </button>
                                ${!this.userData.username ? '<div class="form-text mt-2">You need to set up your profile before commenting.</div>' : ''}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize Bootstrap modal
        const modal = new bootstrap.Modal(document.getElementById('commentModal'));
        modal.show();
        
        // Add event listener to comment form
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const commentText = document.getElementById('comment-text').value;
                const anonymous = document.getElementById('comment-anonymous').checked;
                
                // Add comment to report
                this.addComment(reportId, commentText, anonymous);
                
                // Close modal
                modal.hide();
            });
        }
    },
    
    // Add comment to report
    addComment(reportId, text, anonymous) {
        // Find report
        const reportIndex = this.reports.findIndex(report => report.id === reportId);
        if (reportIndex === -1) return;
        
        // Create comment object
        const comment = {
            id: Date.now().toString(),
            text,
            user: anonymous ? null : this.userData.username,
            timestamp: new Date().toISOString()
        };
        
        // Add comment to report
        this.reports[reportIndex].comments.push(comment);
        
        // Save reports
        this.saveReports();
        
        // Update UI
        const commentButton = document.querySelector(`.comment-btn[data-id="${reportId}"]`);
        if (commentButton) {
            commentButton.innerHTML = `<i class="fas fa-comment me-1"></i> ${this.reports[reportIndex].comments.length}`;
        }
        
        // Show success message
        this.showAlert('Your comment has been added successfully!', 'success');
    },
    
    // Render reports map
    renderReportsMap() {
        const mapContainer = document.getElementById('reports-map-container');
        if (!mapContainer) return;
        
        // Check if map is already initialized
        if (!this.map) {
            // Initialize map
            this.map = L.map('reports-map').setView([27.7172, 85.3240], 12); // Centered on Kathmandu
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            
            // Add scale control
            L.control.scale().addTo(this.map);
        }
        
        // Clear existing markers
        if (this.mapMarkers) {
            this.mapMarkers.forEach(marker => marker.remove());
        }
        
        // Create markers for reports with coordinates
        this.mapMarkers = [];
        this.reports.forEach(report => {
            if (report.coordinates) {
                // Create marker
                const marker = L.marker([report.coordinates.latitude, report.coordinates.longitude])
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="map-popup">
                            <h6>${report.title}</h6>
                            <p class="mb-1">
                                <span class="badge bg-${report.severityColor}">${report.severityName}</span>
                                <span class="badge bg-secondary">
                                    <i class="fas ${report.categoryIcon} me-1"></i> ${report.categoryName}
                                </span>
                            </p>
                            <p class="mb-1">${report.description}</p>
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i> ${report.location}
                            </small>
                        </div>
                    `);
                
                // Add marker to array
                this.mapMarkers.push(marker);
            }
        });
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('App is online');
            this.syncReports();
        });
        
        // Listen for storage events (for multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === 'safeNepal_communityReports') {
                console.log('Reports updated in another tab');
                this.loadReports();
                this.renderReportsList();
                this.renderReportsMap();
            } else if (e.key === 'safeNepal_userData') {
                console.log('User data updated in another tab');
                this.loadUserData();
                this.updateUserProfile();
            }
        });
    },
    
    // Sync reports with server
    syncReports() {
        // In a real application, this would sync local reports with the server
        console.log('Syncing reports with server...');
    },
    
    // Show alert message
    showAlert(message, type = 'info', duration = 5000) {
        // Check if alerts container exists
        let alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) {
            // Create alerts container
            alertsContainer = document.createElement('div');
            alertsContainer.id = 'alerts-container';
            alertsContainer.className = 'position-fixed bottom-0 end-0 p-3';
            alertsContainer.style.zIndex = '1050';
            document.body.appendChild(alertsContainer);
        }
        
        // Create alert ID
        const alertId = 'alert-' + Date.now();
        
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.id = alertId;
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add alert to container
        alertsContainer.appendChild(alertElement);
        
        // Initialize Bootstrap alert
        const bsAlert = new bootstrap.Alert(alertElement);
        
        // Auto-dismiss after duration
        setTimeout(() => {
            bsAlert.close();
        }, duration);
    },
    
    // Get sample reports
    getSampleReports() {
        return [
            {
                id: '1',
                title: 'Landslide blocking road in Sindhupalchok',
                category: 'landslide',
                categoryName: 'Landslide',
                categoryIcon: 'fa-mountain',
                severity: 'high',
                severityName: 'High',
                severityColor: 'danger',
                description: 'A large landslide has blocked the main road to Sindhupalchok. Several vehicles are stranded. Local authorities have been notified but no heavy equipment has arrived yet.',
                location: 'Sindhupalchok District, Bagmati Province',
                coordinates: {
                    latitude: 27.9512,
                    longitude: 85.6846
                },
                timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                user: 'NepalRescue',
                verified: true,
                upvotes: 15,
                downvotes: 0,
                comments: [
                    {
                        id: '101',
                        text: 'I am stuck here too. Any updates on when the road will be cleared?',
                        user: 'Traveler123',
                        timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
                    },
                    {
                        id: '102',
                        text: 'Local authorities have dispatched equipment. Should be cleared within 3-4 hours.',
                        user: 'NepalRescue',
                        timestamp: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
                    }
                ]
            },
            {
                id: '2',
                title: 'Flooding in Terai region',
                category: 'flood',
                categoryName: 'Flood',
                categoryIcon: 'fa-water',
                severity: 'critical',
                severityName: 'Critical',
                severityColor: 'dark',
                description: 'Heavy rainfall has caused severe flooding in parts of the Terai region. Several villages are underwater and people are moving to higher ground. Immediate assistance needed.',
                location: 'Saptari District, Province 2',
                coordinates: {
                    latitude: 26.6483,
                    longitude: 86.7489
                },
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                user: 'FloodAlert',
                verified: true,
                upvotes: 42,
                downvotes: 2,
                comments: [
                    {
                        id: '201',
                        text: 'Red Cross teams are being deployed to the area with emergency supplies.',
                        user: 'NepalRedCross',
                        timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
                    }
                ]
            },
            {
                id: '3',
                title: 'Small earthquake felt in Kathmandu',
                category: 'earthquake',
                categoryName: 'Earthquake',
                categoryIcon: 'fa-house-crack',
                severity: 'medium',
                severityName: 'Medium',
                severityColor: 'warning',
                description: 'A small earthquake was felt in Kathmandu valley around 3:15 PM. No visible damage to buildings in my area, but people came out of their homes and offices.',
                location: 'Kathmandu, Bagmati Province',
                coordinates: {
                    latitude: 27.7172,
                    longitude: 85.3240
                },
                timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                user: 'KathmanduResident',
                verified: false,
                upvotes: 28,
                downvotes: 3,
                comments: [
                    {
                        id: '301',
                        text: 'Felt it in Patan too. It was brief but noticeable.',
                        user: 'PatanLocal',
                        timestamp: new Date(Date.now() - 7000000).toISOString() // 1.9 hours ago
                    },
                    {
                        id: '302',
                        text: 'USGS reports it was magnitude 4.2 with epicenter near Nuwakot.',
                        user: null,
                        timestamp: new Date(Date.now() - 6000000).toISOString() // 1.7 hours ago
                    }
                ]
            },
            {
                id: '4',
                title: 'Fire in Thamel commercial area',
                category: 'fire',
                categoryName: 'Fire',
                categoryIcon: 'fa-fire',
                severity: 'high',
                severityName: 'High',
                severityColor: 'danger',
                description: 'A fire has broken out in a commercial building in Thamel. Fire trucks are on scene trying to control the blaze. Nearby buildings being evacuated.',
                location: 'Thamel, Kathmandu',
                coordinates: {
                    latitude: 27.7154,
                    longitude: 85.3123
                },
                timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
                user: null,
                verified: true,
                upvotes: 35,
                downvotes: 0,
                comments: [
                    {
                        id: '401',
                        text: 'I can see the smoke from Durbar Square. Hope everyone is safe.',
                        user: 'TouristGuide',
                        timestamp: new Date(Date.now() - 5000000).toISOString() // 1.4 hours ago
                    },
                    {
                        id: '402',
                        text: 'Fire is now under control. No casualties reported.',
                        user: 'KathmanduPolice',
                        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
                    }
                ]
            },
            {
                id: '5',
                title: 'Bridge damaged on Prithvi Highway',
                category: 'infrastructure',
                categoryName: 'Infrastructure Damage',
                categoryIcon: 'fa-building-circle-exclamation',
                severity: 'high',
                severityName: 'High',
                severityColor: 'danger',
                description: 'The bridge near Malekhu on Prithvi Highway has been damaged due to heavy rainfall and increased river flow. Traffic is being diverted. Large vehicles cannot pass.',
                location: 'Malekhu, Dhading District',
                coordinates: {
                    latitude: 27.8131,
                    longitude: 84.9312
                },
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                user: 'HighwayPatrol',
                verified: true,
                upvotes: 56,
                downvotes: 1,
                comments: [
                    {
                        id: '501',
                        text: 'Is there an alternative route for buses traveling to Pokhara?',
                        user: 'TravelAgent',
                        timestamp: new Date(Date.now() - 160000000).toISOString() // 1.85 days ago
                    },
                    {
                        id: '502',
                        text: 'Buses are being rerouted via Mugling-Narayanghat road. Adds about 2 hours to journey time.',
                        user: 'HighwayPatrol',
                        timestamp: new Date(Date.now() - 150000000).toISOString() // 1.74 days ago
                    }
                ]
            }
        ];
    },
    
    // Helper function to get time ago string
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : `${interval} years ago`;
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : `${interval} months ago`;
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : `${interval} days ago`;
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        }
        
        return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
    },
    
    // Helper function to get initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }
};

// Initialize community reports when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    communityReportsManager.init();
});