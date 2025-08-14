// Disaster Simulation Training Module for SafeNepal

const simulationManager = {
    // Current simulation
    currentSimulation: null,
    
    // Available simulation types
    simulationTypes: {
        earthquake: {
            name: 'Earthquake Simulation',
            description: 'Learn how to respond during an earthquake with this interactive simulation.',
            icon: 'fa-house-crack',
            difficulty: ['beginner', 'intermediate', 'advanced'],
            duration: [3, 5, 10] // minutes
        },
        flood: {
            name: 'Flood Simulation',
            description: 'Practice flood safety procedures in this step-by-step simulation.',
            icon: 'fa-water',
            difficulty: ['beginner', 'intermediate', 'advanced'],
            duration: [3, 5, 10] // minutes
        },
        landslide: {
            name: 'Landslide Simulation',
            description: 'Learn to identify landslide warnings and take appropriate action.',
            icon: 'fa-mountain',
            difficulty: ['beginner', 'intermediate', 'advanced'],
            duration: [3, 5, 10] // minutes
        },
        fire: {
            name: 'Fire Safety Simulation',
            description: 'Practice fire safety and evacuation procedures.',
            icon: 'fa-fire',
            difficulty: ['beginner', 'intermediate', 'advanced'],
            duration: [3, 5, 10] // minutes
        },
        evacuation: {
            name: 'Evacuation Drill',
            description: 'Practice evacuating to the nearest shelter with this timed simulation.',
            icon: 'fa-person-running',
            difficulty: ['beginner', 'intermediate', 'advanced'],
            duration: [5, 10, 15] // minutes
        }
    },
    
    // User progress
    userProgress: {
        completedSimulations: [],
        badges: [],
        totalPoints: 0
    },
    
    // Initialize simulation manager
    init() {
        // Load user progress
        this.loadUserProgress();
        
        // Set up UI
        this.setupUI();
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    // Load user progress from localStorage
    loadUserProgress() {
        const savedProgress = localStorage.getItem('safeNepal_simulationProgress');
        if (savedProgress) {
            try {
                this.userProgress = JSON.parse(savedProgress);
            } catch (e) {
                console.error('Error parsing simulation progress:', e);
            }
        }
    },
    
    // Save user progress to localStorage
    saveUserProgress() {
        localStorage.setItem('safeNepal_simulationProgress', JSON.stringify(this.userProgress));
    },
    
    // Set up UI elements
    setupUI() {
        // Get simulation container
        const simulationContainer = document.getElementById('simulation-container');
        if (!simulationContainer) return;
        
        // Clear container
        simulationContainer.innerHTML = '';
        
        // Add simulation cards
        Object.keys(this.simulationTypes).forEach(type => {
            const simulation = this.simulationTypes[type];
            const card = this.createSimulationCard(type, simulation);
            simulationContainer.appendChild(card);
        });
        
        // Update progress display
        this.updateProgressDisplay();
    },
    
    // Create a simulation card
    createSimulationCard(type, simulation) {
        // Check if simulation has been completed
        const completed = this.userProgress.completedSimulations.some(s => s.type === type);
        
        // Create card element
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card h-100 ${completed ? 'border-success' : ''}">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas ${simulation.icon} me-2"></i>
                        ${simulation.name}
                    </h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${simulation.description}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="badge bg-info me-2">Duration: ${simulation.duration[0]}-${simulation.duration[2]} min</span>
                        </div>
                        ${completed ? '<span class="badge bg-success"><i class="fas fa-check me-1"></i> Completed</span>' : ''}
                    </div>
                    <div class="difficulty-selector mb-3">
                        <label class="form-label">Difficulty:</label>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="difficulty-${type}" id="${type}-beginner" value="beginner" checked>
                            <label class="btn btn-outline-primary" for="${type}-beginner">Beginner</label>
                            
                            <input type="radio" class="btn-check" name="difficulty-${type}" id="${type}-intermediate" value="intermediate">
                            <label class="btn btn-outline-primary" for="${type}-intermediate">Intermediate</label>
                            
                            <input type="radio" class="btn-check" name="difficulty-${type}" id="${type}-advanced" value="advanced">
                            <label class="btn btn-outline-primary" for="${type}-advanced">Advanced</label>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary w-100 start-simulation" data-type="${type}">
                        <i class="fas fa-play me-2"></i> Start Simulation
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to start button
        const startButton = card.querySelector('.start-simulation');
        startButton.addEventListener('click', () => {
            const difficultyLevel = card.querySelector('input[name="difficulty-' + type + '"]:checked').value;
            this.startSimulation(type, difficultyLevel);
        });
        
        return card;
    },
    
    // Update progress display
    updateProgressDisplay() {
        const progressContainer = document.getElementById('simulation-progress');
        if (!progressContainer) return;
        
        // Calculate completion percentage
        const totalSimulations = Object.keys(this.simulationTypes).length * 3; // 3 difficulty levels per simulation
        const completedCount = this.userProgress.completedSimulations.length;
        const completionPercentage = Math.round((completedCount / totalSimulations) * 100);
        
        // Update progress bar
        progressContainer.innerHTML = `
            <h4>Your Training Progress</h4>
            <div class="progress mb-3">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${completionPercentage}%" 
                    aria-valuenow="${completionPercentage}" aria-valuemin="0" aria-valuemax="100">
                    ${completionPercentage}%
                </div>
            </div>
            <div class="d-flex justify-content-between mb-3">
                <div>
                    <i class="fas fa-medal me-1"></i> Points: ${this.userProgress.totalPoints}
                </div>
                <div>
                    <i class="fas fa-trophy me-1"></i> Completed: ${completedCount}/${totalSimulations}
                </div>
            </div>
            <div class="badges-container d-flex flex-wrap gap-2 mb-3">
                ${this.renderBadges()}
            </div>
        `;
    },
    
    // Render user badges
    renderBadges() {
        if (this.userProgress.badges.length === 0) {
            return '<p class="text-muted">Complete simulations to earn badges!</p>';
        }
        
        return this.userProgress.badges.map(badge => {
            return `
                <div class="badge bg-warning text-dark p-2" title="${badge.description}">
                    <i class="fas ${badge.icon} me-1"></i> ${badge.name}
                </div>
            `;
        }).join('');
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Listen for simulation completion events
        document.addEventListener('simulation_completed', (e) => {
            if (e.detail && e.detail.simulation) {
                this.completeSimulation(e.detail.simulation, e.detail.score, e.detail.time);
            }
        });
    },
    
    // Start a simulation
    startSimulation(type, difficultyLevel) {
        // Check if simulation type exists
        if (!this.simulationTypes[type]) {
            console.error(`Simulation type '${type}' not found`);
            return;
        }
        
        // Get simulation details
        const simulation = this.simulationTypes[type];
        const difficultyIndex = simulation.difficulty.indexOf(difficultyLevel);
        if (difficultyIndex === -1) {
            console.error(`Difficulty level '${difficultyLevel}' not found for simulation type '${type}'`);
            return;
        }
        
        // Set current simulation
        this.currentSimulation = {
            type,
            name: simulation.name,
            difficulty: difficultyLevel,
            difficultyIndex,
            duration: simulation.duration[difficultyIndex],
            startTime: new Date(),
            steps: this.getSimulationSteps(type, difficultyLevel),
            currentStep: 0,
            score: 0,
            maxScore: 0,
            mistakes: 0
        };
        
        // Calculate max score
        this.currentSimulation.maxScore = this.currentSimulation.steps.reduce((total, step) => {
            return total + (step.points || 10);
        }, 0);
        
        // Show simulation modal
        this.showSimulationModal();
    },
    
    // Get simulation steps based on type and difficulty
    getSimulationSteps(type, difficulty) {
        // In a real application, these would be loaded from a database or API
        // For this demo, we'll use hardcoded steps for each simulation type and difficulty
        
        const steps = {
            earthquake: {
                beginner: [
                    {
                        title: 'Drop',
                        description: 'Drop down onto your hands and knees before the earthquake knocks you down.',
                        action: 'drop',
                        correctResponse: 'You dropped to the ground safely.',
                        incorrectResponse: 'You remained standing and could lose balance during shaking.',
                        image: 'earthquake-drop.jpg',
                        points: 10,
                        options: [
                            { text: 'Drop to the ground', correct: true },
                            { text: 'Run outside', correct: false },
                            { text: 'Stand in a doorway', correct: false },
                            { text: 'Hide under a table', correct: false }
                        ]
                    },
                    {
                        title: 'Cover',
                        description: 'Cover your head and neck with your arms to protect yourself from falling debris.',
                        action: 'cover',
                        correctResponse: 'You covered your head and neck properly.',
                        incorrectResponse: 'You did not protect your head and neck adequately.',
                        image: 'earthquake-cover.jpg',
                        points: 10,
                        options: [
                            { text: 'Cover head with arms', correct: true },
                            { text: 'Crawl under a sturdy desk', correct: true },
                            { text: 'Stand against a wall', correct: false },
                            { text: 'Cover eyes only', correct: false }
                        ]
                    },
                    {
                        title: 'Hold On',
                        description: 'Hold on to your shelter (or your head and neck) until the shaking stops.',
                        action: 'hold',
                        correctResponse: 'You held on until the shaking stopped.',
                        incorrectResponse: 'You moved before the shaking stopped, which is dangerous.',
                        image: 'earthquake-hold.jpg',
                        points: 10,
                        options: [
                            { text: 'Hold on until shaking stops', correct: true },
                            { text: 'Get up immediately', correct: false },
                            { text: 'Let go after 10 seconds', correct: false },
                            { text: 'Call for help immediately', correct: false }
                        ]
                    }
                ],
                intermediate: [
                    // More complex steps for intermediate difficulty
                    // Would include additional steps like checking for injuries, gas leaks, etc.
                ],
                advanced: [
                    // Complex scenario for advanced difficulty
                    // Would include full evacuation, first aid, communication steps
                ]
            },
            flood: {
                beginner: [
                    {
                        title: 'Monitor Alerts',
                        description: 'Stay informed about flood warnings and alerts in your area.',
                        action: 'monitor',
                        correctResponse: 'You checked the latest flood alerts.',
                        incorrectResponse: 'You missed important flood warning information.',
                        image: 'flood-alert.jpg',
                        points: 10,
                        options: [
                            { text: 'Check official weather alerts', correct: true },
                            { text: 'Ignore news reports', correct: false },
                            { text: 'Ask neighbors only', correct: false },
                            { text: 'Check social media only', correct: false }
                        ]
                    },
                    {
                        title: 'Move to Higher Ground',
                        description: 'If flooding is imminent, move to higher ground immediately.',
                        action: 'evacuate',
                        correctResponse: 'You moved to higher ground safely.',
                        incorrectResponse: 'You remained in a flood-prone area.',
                        image: 'flood-higher-ground.jpg',
                        points: 10,
                        options: [
                            { text: 'Move to higher ground', correct: true },
                            { text: 'Stay in basement', correct: false },
                            { text: 'Try to drive through water', correct: false },
                            { text: 'Wait to see how high water gets', correct: false }
                        ]
                    },
                    {
                        title: 'Avoid Floodwaters',
                        description: 'Never walk, swim, or drive through floodwaters.',
                        action: 'avoid',
                        correctResponse: 'You avoided dangerous floodwaters.',
                        incorrectResponse: 'You risked entering floodwaters, which is extremely dangerous.',
                        image: 'flood-avoid.jpg',
                        points: 10,
                        options: [
                            { text: 'Find an alternate route', correct: true },
                            { text: 'Wade through shallow water', correct: false },
                            { text: 'Drive slowly through water', correct: false },
                            { text: 'Swim across flooded area', correct: false }
                        ]
                    }
                ],
                intermediate: [],
                advanced: []
            },
            landslide: {
                beginner: [
                    {
                        title: 'Recognize Warning Signs',
                        description: 'Learn to identify the warning signs of an imminent landslide.',
                        action: 'identify',
                        correctResponse: 'You correctly identified landslide warning signs.',
                        incorrectResponse: 'You missed critical warning signs of an imminent landslide.',
                        image: 'landslide-signs.jpg',
                        points: 10,
                        options: [
                            { text: 'Cracks appearing in ground', correct: true },
                            { text: 'Doors/windows sticking', correct: true },
                            { text: 'Clear blue sky', correct: false },
                            { text: 'Birds chirping normally', correct: false }
                        ]
                    },
                    {
                        title: 'Evacuate Quickly',
                        description: 'If you suspect a landslide is imminent, evacuate immediately.',
                        action: 'evacuate',
                        correctResponse: 'You evacuated the area safely.',
                        incorrectResponse: 'You delayed evacuation, putting yourself at risk.',
                        image: 'landslide-evacuate.jpg',
                        points: 10,
                        options: [
                            { text: 'Leave area immediately', correct: true },
                            { text: 'Gather all belongings first', correct: false },
                            { text: 'Wait for official evacuation order', correct: false },
                            { text: 'Stay to protect property', correct: false }
                        ]
                    },
                    {
                        title: 'Move Away from Path',
                        description: 'Move away from the path of a landslide or debris flow.',
                        action: 'move',
                        correctResponse: 'You moved away from the landslide path.',
                        incorrectResponse: 'You remained in the path of the landslide.',
                        image: 'landslide-path.jpg',
                        points: 10,
                        options: [
                            { text: 'Move uphill if possible', correct: true },
                            { text: 'Move to side of flow', correct: true },
                            { text: 'Run downhill', correct: false },
                            { text: 'Hide behind a tree', correct: false }
                        ]
                    }
                ],
                intermediate: [],
                advanced: []
            },
            fire: {
                beginner: [
                    {
                        title: 'Alert Others',
                        description: 'If you discover a fire, alert others in the building immediately.',
                        action: 'alert',
                        correctResponse: 'You alerted others about the fire.',
                        incorrectResponse: 'You failed to warn others about the fire.',
                        image: 'fire-alert.jpg',
                        points: 10,
                        options: [
                            { text: 'Shout "Fire!"', correct: true },
                            { text: 'Activate fire alarm', correct: true },
                            { text: 'Leave quietly', correct: false },
                            { text: 'Call family only', correct: false }
                        ]
                    },
                    {
                        title: 'Evacuate Safely',
                        description: 'Evacuate the building quickly and safely.',
                        action: 'evacuate',
                        correctResponse: 'You evacuated safely following proper procedures.',
                        incorrectResponse: 'Your evacuation method was dangerous.',
                        image: 'fire-evacuate.jpg',
                        points: 10,
                        options: [
                            { text: 'Use stairs, not elevator', correct: true },
                            { text: 'Stay low if there is smoke', correct: true },
                            { text: 'Use elevator to exit faster', correct: false },
                            { text: 'Stop to collect valuables', correct: false }
                        ]
                    },
                    {
                        title: 'Call Emergency Services',
                        description: 'Call emergency services (112) once you are safely outside.',
                        action: 'call',
                        correctResponse: 'You called emergency services with the correct information.',
                        incorrectResponse: 'You provided incomplete information to emergency services.',
                        image: 'fire-call.jpg',
                        points: 10,
                        options: [
                            { text: 'Call from safe location', correct: true },
                            { text: 'Provide exact address', correct: true },
                            { text: 'Call while still inside', correct: false },
                            { text: 'Assume someone else called', correct: false }
                        ]
                    }
                ],
                intermediate: [],
                advanced: []
            },
            evacuation: {
                beginner: [
                    {
                        title: 'Prepare Emergency Kit',
                        description: 'Quickly gather your emergency kit before evacuating.',
                        action: 'prepare',
                        correctResponse: 'You gathered essential emergency supplies.',
                        incorrectResponse: 'You forgot critical emergency supplies.',
                        image: 'evacuation-kit.jpg',
                        points: 10,
                        options: [
                            { text: 'Grab pre-packed emergency kit', correct: true },
                            { text: 'Take water and medications', correct: true },
                            { text: 'Pack large suitcase', correct: false },
                            { text: 'Leave without any supplies', correct: false }
                        ]
                    },
                    {
                        title: 'Secure Your Home',
                        description: 'Take quick steps to secure your home before leaving.',
                        action: 'secure',
                        correctResponse: 'You secured your home properly before evacuating.',
                        incorrectResponse: 'You left your home vulnerable during evacuation.',
                        image: 'evacuation-secure.jpg',
                        points: 10,
                        options: [
                            { text: 'Turn off utilities if instructed', correct: true },
                            { text: 'Lock doors and windows', correct: true },
                            { text: 'Leave everything on', correct: false },
                            { text: 'Leave doors unlocked', correct: false }
                        ]
                    },
                    {
                        title: 'Follow Evacuation Route',
                        description: 'Follow designated evacuation routes to the nearest shelter.',
                        action: 'route',
                        correctResponse: 'You followed the correct evacuation route.',
                        incorrectResponse: 'You took a dangerous or inefficient evacuation route.',
                        image: 'evacuation-route.jpg',
                        points: 10,
                        options: [
                            { text: 'Follow official evacuation routes', correct: true },
                            { text: 'Follow emergency vehicle directions', correct: true },
                            { text: 'Take shortcuts through unsafe areas', correct: false },
                            { text: 'Drive against traffic flow', correct: false }
                        ]
                    }
                ],
                intermediate: [],
                advanced: []
            }
        };
        
        return steps[type][difficulty] || [];
    },
    
    // Show simulation modal
    showSimulationModal() {
        // Check if modal container exists
        let modalContainer = document.getElementById('simulation-modal-container');
        if (!modalContainer) {
            // Create modal container
            modalContainer = document.createElement('div');
            modalContainer.id = 'simulation-modal-container';
            document.body.appendChild(modalContainer);
        }
        
        // Create modal content
        const modalContent = `
            <div class="modal fade" id="simulationModal" tabindex="-1" aria-labelledby="simulationModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="simulationModalLabel">
                                ${this.currentSimulation.name} - ${this.capitalizeFirstLetter(this.currentSimulation.difficulty)}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="simulation-content">
                            ${this.renderSimulationStep()}
                        </div>
                        <div class="modal-footer">
                            <div class="progress w-100 mb-3">
                                <div class="progress-bar bg-success" role="progressbar" style="width: 0%" 
                                    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="simulation-progress-bar">
                                    0%
                                </div>
                            </div>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Exit Simulation</button>
                            <button type="button" class="btn btn-primary" id="simulation-next-btn" disabled>Next Step</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Set modal container content
        modalContainer.innerHTML = modalContent;
        
        // Initialize Bootstrap modal
        const modal = new bootstrap.Modal(document.getElementById('simulationModal'));
        modal.show();
        
        // Add event listener to next button
        const nextButton = document.getElementById('simulation-next-btn');
        nextButton.addEventListener('click', () => {
            this.nextSimulationStep();
        });
        
        // Add event listeners to option buttons
        this.addOptionEventListeners();
    },
    
    // Render current simulation step
    renderSimulationStep() {
        // Get current step
        const step = this.currentSimulation.steps[this.currentSimulation.currentStep];
        if (!step) return '<div class="alert alert-danger">Error: Step not found</div>';
        
        // Update progress bar
        const progressPercentage = Math.round(((this.currentSimulation.currentStep) / this.currentSimulation.steps.length) * 100);
        const progressBar = document.getElementById('simulation-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.setAttribute('aria-valuenow', progressPercentage);
            progressBar.textContent = `${progressPercentage}%`;
        }
        
        // Render step content
        return `
            <div class="simulation-step" data-step="${this.currentSimulation.currentStep}">
                <h4 class="mb-3">${step.title}</h4>
                <div class="row mb-4">
                    <div class="col-md-6">
                        <p>${step.description}</p>
                        <div class="options-container">
                            <p class="fw-bold">What would you do?</p>
                            ${step.options.map((option, index) => `
                                <div class="form-check mb-2">
                                    <input class="form-check-input simulation-option" type="checkbox" id="option-${index}" data-index="${index}" data-correct="${option.correct}">
                                    <label class="form-check-label" for="option-${index}">
                                        ${option.text}
                                    </label>
                                </div>
                            `).join('')}
                            <div class="feedback-container mt-3 d-none" id="step-feedback"></div>
                        </div>
                        <button class="btn btn-primary mt-3" id="check-answer-btn">Check Answer</button>
                    </div>
                    <div class="col-md-6">
                        <div class="simulation-image-container">
                            <img src="/images/simulations/${step.image}" alt="${step.title}" class="img-fluid rounded">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Add event listeners to option buttons
    addOptionEventListeners() {
        // Add event listener to check answer button
        const checkAnswerBtn = document.getElementById('check-answer-btn');
        if (checkAnswerBtn) {
            checkAnswerBtn.addEventListener('click', () => {
                this.checkAnswer();
            });
        }
    },
    
    // Check user's answer
    checkAnswer() {
        // Get current step
        const step = this.currentSimulation.steps[this.currentSimulation.currentStep];
        if (!step) return;
        
        // Get selected options
        const selectedOptions = Array.from(document.querySelectorAll('.simulation-option:checked')).map(option => {
            return {
                index: parseInt(option.getAttribute('data-index')),
                correct: option.getAttribute('data-correct') === 'true'
            };
        });
        
        // Check if any options are selected
        if (selectedOptions.length === 0) {
            alert('Please select at least one option.');
            return;
        }
        
        // Check if all selected options are correct
        const allCorrect = selectedOptions.every(option => option.correct);
        
        // Check if all correct options are selected
        const correctOptions = step.options.filter(option => option.correct);
        const allSelected = correctOptions.every((_, index) => {
            return selectedOptions.some(option => option.index === index && option.correct);
        });
        
        // Calculate score for this step
        let stepScore = 0;
        if (allCorrect && allSelected) {
            // Full points if all correct options are selected and no incorrect options
            stepScore = step.points || 10;
        } else if (allCorrect) {
            // Partial points if all selected options are correct but not all correct options are selected
            stepScore = Math.floor((step.points || 10) / 2);
        }
        
        // Update simulation score
        this.currentSimulation.score += stepScore;
        
        // If incorrect, increment mistakes
        if (!allCorrect || !allSelected) {
            this.currentSimulation.mistakes++;
        }
        
        // Show feedback
        const feedbackContainer = document.getElementById('step-feedback');
        if (feedbackContainer) {
            feedbackContainer.classList.remove('d-none');
            feedbackContainer.innerHTML = `
                <div class="alert ${allCorrect && allSelected ? 'alert-success' : 'alert-danger'}">
                    <p class="mb-0">
                        <i class="fas ${allCorrect && allSelected ? 'fa-check-circle' : 'fa-times-circle'} me-2"></i>
                        ${allCorrect && allSelected ? step.correctResponse : step.incorrectResponse}
                    </p>
                </div>
                ${!allSelected ? `
                    <div class="alert alert-warning">
                        <p class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i> You missed some correct actions.</p>
                    </div>
                ` : ''}
            `;
        }
        
        // Disable check answer button
        const checkAnswerBtn = document.getElementById('check-answer-btn');
        if (checkAnswerBtn) {
            checkAnswerBtn.disabled = true;
        }
        
        // Disable options
        const options = document.querySelectorAll('.simulation-option');
        options.forEach(option => {
            option.disabled = true;
            
            // Highlight correct and incorrect options
            const isCorrect = option.getAttribute('data-correct') === 'true';
            const isChecked = option.checked;
            const label = option.nextElementSibling;
            
            if (isCorrect) {
                label.classList.add('text-success');
                label.innerHTML = `${label.textContent} <i class="fas fa-check"></i>`;
            } else if (isChecked) {
                label.classList.add('text-danger');
                label.innerHTML = `${label.textContent} <i class="fas fa-times"></i>`;
            }
        });
        
        // Enable next button
        const nextButton = document.getElementById('simulation-next-btn');
        if (nextButton) {
            nextButton.disabled = false;
        }
    },
    
    // Move to next simulation step
    nextSimulationStep() {
        // Increment current step
        this.currentSimulation.currentStep++;
        
        // Check if simulation is complete
        if (this.currentSimulation.currentStep >= this.currentSimulation.steps.length) {
            this.completeSimulation();
            return;
        }
        
        // Update simulation content
        const simulationContent = document.getElementById('simulation-content');
        if (simulationContent) {
            simulationContent.innerHTML = this.renderSimulationStep();
        }
        
        // Add event listeners to option buttons
        this.addOptionEventListeners();
        
        // Disable next button
        const nextButton = document.getElementById('simulation-next-btn');
        if (nextButton) {
            nextButton.disabled = true;
        }
    },
    
    // Complete simulation
    completeSimulation() {
        // Calculate final score percentage
        const scorePercentage = Math.round((this.currentSimulation.score / this.currentSimulation.maxScore) * 100);
        
        // Calculate time taken
        const endTime = new Date();
        const timeTaken = Math.round((endTime - this.currentSimulation.startTime) / 1000); // in seconds
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;
        
        // Determine result message
        let resultMessage = '';
        let resultClass = '';
        
        if (scorePercentage >= 90) {
            resultMessage = 'Excellent! You demonstrated outstanding disaster preparedness skills.';
            resultClass = 'alert-success';
        } else if (scorePercentage >= 70) {
            resultMessage = 'Good job! You have solid disaster preparedness knowledge.';
            resultClass = 'alert-info';
        } else if (scorePercentage >= 50) {
            resultMessage = 'You passed, but there\'s room for improvement in your disaster response.';
            resultClass = 'alert-warning';
        } else {
            resultMessage = 'You need more practice with disaster preparedness procedures.';
            resultClass = 'alert-danger';
        }
        
        // Update simulation content with results
        const simulationContent = document.getElementById('simulation-content');
        if (simulationContent) {
            simulationContent.innerHTML = `
                <div class="simulation-results text-center py-4">
                    <h4 class="mb-4">Simulation Complete!</h4>
                    
                    <div class="alert ${resultClass} mb-4">
                        <p class="mb-0">${resultMessage}</p>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h1 class="display-4 mb-0">${scorePercentage}%</h1>
                                    <p class="text-muted">Score</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h1 class="display-4 mb-0">${minutes}:${seconds.toString().padStart(2, '0')}</h1>
                                    <p class="text-muted">Time</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h1 class="display-4 mb-0">${this.currentSimulation.mistakes}</h1>
                                    <p class="text-muted">Mistakes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p class="mb-4">You've earned ${this.currentSimulation.score} points!</p>
                    
                    <div class="d-flex justify-content-center gap-3">
                        <button class="btn btn-primary" id="retry-simulation-btn">
                            <i class="fas fa-redo me-2"></i> Try Again
                        </button>
                        <button class="btn btn-success" data-bs-dismiss="modal">
                            <i class="fas fa-check me-2"></i> Finish
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.getElementById('retry-simulation-btn');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    // Reset current step and score
                    this.currentSimulation.currentStep = 0;
                    this.currentSimulation.score = 0;
                    this.currentSimulation.mistakes = 0;
                    this.currentSimulation.startTime = new Date();
                    
                    // Update simulation content
                    simulationContent.innerHTML = this.renderSimulationStep();
                    
                    // Add event listeners to option buttons
                    this.addOptionEventListeners();
                    
                    // Disable next button
                    const nextButton = document.getElementById('simulation-next-btn');
                    if (nextButton) {
                        nextButton.disabled = true;
                    }
                    
                    // Reset progress bar
                    const progressBar = document.getElementById('simulation-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = '0%';
                        progressBar.setAttribute('aria-valuenow', 0);
                        progressBar.textContent = '0%';
                    }
                });
            }
        }
        
        // Hide next button
        const nextButton = document.getElementById('simulation-next-btn');
        if (nextButton) {
            nextButton.style.display = 'none';
        }
        
        // Save simulation results
        this.saveSimulationResults({
            type: this.currentSimulation.type,
            difficulty: this.currentSimulation.difficulty,
            score: this.currentSimulation.score,
            maxScore: this.currentSimulation.maxScore,
            scorePercentage,
            mistakes: this.currentSimulation.mistakes,
            timeTaken,
            completedAt: new Date().toISOString()
        });
    },
    
    // Save simulation results
    saveSimulationResults(results) {
        // Add to completed simulations
        this.userProgress.completedSimulations.push(results);
        
        // Add points to total
        this.userProgress.totalPoints += results.score;
        
        // Check for badges
        this.checkForBadges(results);
        
        // Save progress
        this.saveUserProgress();
        
        // Update progress display
        this.updateProgressDisplay();
    },
    
    // Check for badges
    checkForBadges(results) {
        // Check for first completion badge
        if (this.userProgress.completedSimulations.length === 1) {
            this.awardBadge({
                id: 'first_simulation',
                name: 'First Responder',
                description: 'Completed your first simulation',
                icon: 'fa-award'
            });
        }
        
        // Check for perfect score badge
        if (results.scorePercentage === 100) {
            this.awardBadge({
                id: 'perfect_score',
                name: 'Perfect Score',
                description: 'Achieved a perfect score in a simulation',
                icon: 'fa-star'
            });
        }
        
        // Check for speed demon badge (completed in less than half the expected time)
        const expectedTime = this.simulationTypes[results.type].duration[
            this.simulationTypes[results.type].difficulty.indexOf(results.difficulty)
        ] * 60; // convert to seconds
        
        if (results.timeTaken < expectedTime / 2) {
            this.awardBadge({
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Completed a simulation in record time',
                icon: 'fa-bolt'
            });
        }
        
        // Check for disaster master badge (completed all simulations of one type)
        const completedDifficulties = this.userProgress.completedSimulations
            .filter(sim => sim.type === results.type)
            .map(sim => sim.difficulty);
        
        const allDifficulties = this.simulationTypes[results.type].difficulty;
        
        if (allDifficulties.every(diff => completedDifficulties.includes(diff))) {
            this.awardBadge({
                id: `${results.type}_master`,
                name: `${this.capitalizeFirstLetter(results.type)} Master`,
                description: `Mastered all ${this.capitalizeFirstLetter(results.type)} simulations`,
                icon: this.simulationTypes[results.type].icon
            });
        }
    },
    
    // Award a badge
    awardBadge(badge) {
        // Check if badge already exists
        if (!this.userProgress.badges.some(b => b.id === badge.id)) {
            this.userProgress.badges.push(badge);
        }
    },
    
    // Helper function to capitalize first letter
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};

// Initialize simulation manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    simulationManager.init();
});