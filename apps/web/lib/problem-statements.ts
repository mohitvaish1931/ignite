// IEEE IGNITE Hackathon 2026 problem statements, transcribed from the official PDF
// (public/docs/ieee-ignite-hackathon-problem-statements-2026.pdf). The PDF is the source of
// truth: if it is reissued, replace the file and update this list to match.

export const PS_PAGE_PATH = "/hackathons/problem-statements";
export const PS_PDF_PATH = "/docs/ieee-ignite-hackathon-problem-statements-2026.pdf";
/** Name the PDF saves under when downloaded. */
export const PS_PDF_FILENAME = "IEEE-IGNITE-Hackathon-2026-Problem-Statements.pdf";
export const PS_PDF_PAGES = 18;

export type ThemeId = "ai-safety" | "energy" | "iot" | "campus";

export const PS_THEMES: { id: ThemeId; name: string; short: string }[] = [
  { id: "ai-safety", name: "AI, Cybercrime, Financial Fraud & Public Safety", short: "AI & Cybercrime" },
  { id: "energy", name: "Smart Energy, Electric Mobility & Sustainable Infrastructure", short: "Smart Energy & EV" },
  { id: "iot", name: "IoT, Industrial Automation & Smart Systems", short: "IoT & Automation" },
  { id: "campus", name: "Robotics, Smart Campus & Digital Applications", short: "Robotics & Smart Campus" },
];

/** A titled part of a statement: a bullet list, or a short paragraph. */
export type PsSection = { heading: string; items?: string[]; text?: string };

export type ProblemStatement = {
  id: string;
  title: string;
  theme: ThemeId;
  /** Field line some statements open with, e.g. "EV Motor Drives, Power Electronics & IoT". */
  area?: string;
  description: string[];
  sections: PsSection[];
  domain?: string;
  constraint?: string;
};

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  // ---------- AI, Cybercrime, Financial Fraud & Public Safety ----------
  {
    id: "SKIT001",
    title: "AI-Based Face Identification from ATM Footage",
    theme: "ai-safety",
    description: [
      "Develop an AI-based video analytics system capable of identifying and extracting the most relevant facial image of a person from ATM/CCTV footage recorded during a cash withdrawal transaction.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Detect persons appearing in ATM footage.",
          "Identify the individual associated with a specific transaction.",
          "Select the clearest/highest-quality face frame.",
          "Perform face detection and image-quality assessment.",
          "Handle varying illumination, face angles, partial occlusion and low-resolution footage.",
          "Provide a searchable interface for authorized investigators.",
        ],
      },
    ],
  },
  {
    id: "SKIT002",
    title: "AI-Based Detection of Suspicious Financial Advertisements",
    theme: "ai-safety",
    description: [
      "Develop an AI-powered system to identify suspicious advertisements/posts on social media and internet platforms promoting the sale of bank accounts, ATM cards, credit/debit cards, current accounts or savings accounts.",
    ],
    sections: [
      {
        heading: "Expected outcome",
        items: [
          "Collect or process publicly available advertisement data.",
          "Identify suspicious keywords, images, phone numbers, URLs and payment details.",
          "Classify advertisements based on risk indicators.",
          "Detect repeated or coordinated advertisements.",
          "Provide evidence/context supporting a suspicious classification.",
          "Generate alerts and an investigation dashboard.",
        ],
      },
    ],
  },
  {
    id: "SKIT003",
    title: "AI-Based Detection of Suspicious Gambling, Betting and Ponzi Websites",
    theme: "ai-safety",
    description: [
      "Develop an intelligent web-analysis system that detects and classifies websites potentially associated with illegal/suspicious gambling, betting, multi-level marketing fraud, Ponzi schemes or other deceptive financial activities.",
    ],
    sections: [
      {
        heading: "Expected outcome",
        items: [
          "Analyze website content, domain information and publicly available metadata.",
          "Identify suspicious linguistic and promotional patterns.",
          "Detect misleading financial-return claims.",
          "Analyze links, contact information and payment-related information.",
          "Assign explainable risk indicators rather than relying only on a black-box classification.",
          "Provide a dashboard for investigators.",
        ],
      },
    ],
  },
  {
    id: "SKIT004",
    title: "AI-Based Social Media Threat Monitoring System",
    theme: "ai-safety",
    description: [
      "Develop an AI-driven platform for monitoring publicly available social-media content to identify early indicators of misinformation, cybercrime, coordinated harmful activity or emerging social tensions.",
    ],
    sections: [
      {
        heading: "Expected outcome",
        items: [
          "Process text and relevant multimedia metadata.",
          "Identify misinformation-related patterns.",
          "Detect emerging keywords, topics and unusual activity.",
          "Identify potential cybercrime indicators.",
          "Provide trend and geographic/time-based visualization where data permits.",
          "Generate alerts for human review.",
        ],
      },
    ],
    constraint:
      "The system should support human review and verification rather than automatically treating detected content as confirmed misinformation or criminal activity.",
  },
  {
    id: "SKIT005",
    title: "AI-Based Press Note Generation and Official Communication Assistant",
    theme: "ai-safety",
    description: [
      "Develop an AI-assisted platform that converts verified event information, official inputs and structured data into standardized draft press notes for institutional or public-authority communication.",
    ],
    sections: [
      {
        heading: "Expected outcome",
        items: [
          "Accept structured information such as event, date, location, participants and key outcomes.",
          "Generate a properly structured draft press note.",
          "Maintain formal and neutral language.",
          "Support Hindi/English or multilingual output.",
          "Generate headlines, summaries and detailed versions.",
          "Allow human officials to edit and approve the final communication.",
          "Maintain source information and revision history.",
        ],
      },
    ],
  },

  // ---------- Smart Energy, Electric Mobility & Sustainable Infrastructure ----------
  {
    id: "SKIT006",
    title: "Digital Twin-Based Predictive Diagnostics for EV ECUs Using CAN",
    theme: "energy",
    description: [
      "Develop a CAN-based digital-twin platform for monitoring EV electronic control units and predicting abnormal operating conditions before they result in system failure.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Acquire real-time CAN data.",
          "Monitor voltage, current and temperature.",
          "Decode relevant CAN messages.",
          "Develop a digital representation of ECU behaviour.",
          "Detect over-voltage, under-voltage, over-current and over-temperature conditions.",
          "Maintain historical fault information.",
          "Develop predictive diagnostics using AI/ML.",
          "Provide an ECU health dashboard.",
        ],
      },
    ],
    domain: "Electric Vehicles, CAN, Embedded Systems, Digital Twin, Predictive AI",
  },
  {
    id: "SKIT007",
    title: "AI-Based Optimal Placement and Energy Management of BESS",
    theme: "energy",
    description: [
      "Develop an optimization framework for determining the appropriate location, capacity and operating schedule of Battery Energy Storage Systems in a distribution network with renewable-energy integration.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Use IEEE 33-bus/69-bus or another suitable test network.",
          "Determine optimal BESS location.",
          "Determine power and energy capacity.",
          "Model charging/discharging behaviour.",
          "Maintain permissible voltage limits.",
          "Reduce active power losses and peak demand.",
          "Consider solar PV and/or EV charging loads.",
          "Evaluate technical and economic performance.",
          "Provide a visualization/dashboard of optimization results.",
        ],
      },
    ],
  },
  {
    id: "SKIT008",
    title: "IoT-Based Smart Vector Control of Three-Phase Induction Motor for EV Applications",
    theme: "energy",
    area: "EV Motor Drives, Power Electronics & IoT",
    description: [
      "Electric vehicles require efficient and reliable motor-drive systems. Three-phase induction motors provide ruggedness and wide speed-control capability, but their performance depends on effective control, monitoring and protection.",
      "Develop an IoT-enabled vector-controlled three-phase induction motor drive for an EV propulsion application.",
    ],
    sections: [
      {
        heading: "Proposed system should",
        items: [
          "Implement Field-Oriented Control (FOC)/Vector Control.",
          "Control motor speed and torque.",
          "Generate appropriate PWM signals for the inverter.",
        ],
      },
      {
        heading: "Expected outcome",
        text: "An integrated platform combining: Motor Control + Sensing + IoT Monitoring + Fault Detection + Protection",
      },
    ],
  },
  {
    id: "SKIT009",
    title: "Turn-Charge: Kinetic Energy Harvesting Smart Turnstile",
    theme: "energy",
    description: [
      "Turnstiles used at metro stations, colleges, stadiums, offices and other high-footfall locations undergo repeated mechanical rotation. A significant amount of mechanical energy associated with this repetitive motion is normally dissipated. Develop a kinetic energy harvesting turnstile that converts a portion of the rotational motion of a turnstile into electrical energy and stores it for useful low-power applications.",
    ],
    sections: [
      {
        heading: "Proposed system should",
        items: [
          "Capture rotational mechanical energy from turnstile movement.",
          "Convert mechanical energy into electrical energy using a suitable generator.",
          "Store harvested energy in a battery/supercapacitor.",
          "Measure rotations, voltage, current and harvested energy.",
          "Demonstrate a useful low-power load.",
        ],
      },
      {
        heading: "Expected outcome",
        text: "A functional prototype demonstrating how repeated human movement can be converted into useful electrical energy.",
      },
    ],
  },
  {
    id: "SKIT010",
    title: "Optimal Placement and Sizing of Multiple Distributed Generation Units in Radial Distribution Networks",
    theme: "energy",
    description: [
      "The increasing integration of distributed generation (DG), including solar PV and other local renewable-energy sources, can improve distribution-system performance but may also introduce voltage rise, reverse power flow and network losses when DG units are improperly located or sized.",
      "Develop an optimization-based framework for placement and sizing of multiple DG units in a radial distribution network.",
    ],
    sections: [
      {
        heading: "Expected outcome",
        text: "An optimized radial distribution network with appropriate DG placement and sizing while satisfying voltage and operating constraints.",
      },
    ],
    domain: "Smart Grid, Renewable Energy, Power Systems, Optimization",
  },
  {
    id: "SKIT011",
    title: "IoT-Based Smart Water Quality Monitoring System",
    theme: "energy",
    description: [
      "Develop a low-cost IoT-based system for continuous monitoring of water quality in tanks, campuses, residential areas or other suitable environments.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Measure parameters such as pH, turbidity and temperature.",
          "Support additional water-quality sensors where feasible.",
          "Continuously collect sensor readings.",
          "Transmit data to a central dashboard using Wi-Fi, LoRa, GSM or another suitable communication technology.",
          "Detect abnormal water-quality conditions.",
          "Generate real-time alerts.",
          "Maintain historical water-quality records.",
          "Provide graphical visualization and trend analysis.",
          "Support calibration and sensor-status monitoring.",
        ],
      },
    ],
  },
  {
    id: "SKIT012",
    title: "IoT-Based Smart Classroom Environment and Energy Monitoring System",
    theme: "energy",
    description: [
      "Develop an IoT-enabled classroom monitoring system that measures environmental conditions and intelligently assists in managing classroom comfort and energy consumption.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Measure temperature and humidity.",
          "Monitor classroom occupancy using appropriate sensors.",
          "Monitor light intensity and electrical energy consumption.",
          "Detect unnecessary operation of lights, fans or other connected loads.",
          "Generate occupancy-based energy-use recommendations.",
          "Provide real-time monitoring through a web/mobile dashboard.",
          "Maintain historical energy and environmental data.",
          "Generate alerts for abnormal conditions.",
          "Provide energy-consumption analytics and reports.",
        ],
      },
    ],
  },

  // ---------- IoT, Industrial Automation & Smart Systems ----------
  {
    id: "SKIT013",
    title: "AI-ML Based Smart and Demand-Responsive Waste Collection System",
    theme: "iot",
    description: [
      "Develop an IoT and AI/ML-enabled waste collection system that monitors multiple smart bins, predicts waste accumulation and dynamically generates collection priorities and optimized routes.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Measure bin fill level using ultrasonic/ToF sensing.",
          "Measure accumulated waste weight.",
          "Provide unique identification and location for each bin.",
          "Transmit real-time data to a central platform.",
          "Generate alerts before overflow.",
          "Predict future fill levels using historical data.",
          "Prioritize bins requiring collection.",
          "Optimize collection vehicle routes.",
          "Provide a municipal dashboard and historical reports.",
        ],
      },
    ],
  },
  {
    id: "SKIT014",
    title: "Smart Laser-Cutting Machine Safety & Monitoring System",
    theme: "iot",
    description: [
      "Develop a retrofit-compatible intelligent safety-monitoring system for laser-cutting machines used in educational laboratories, fabrication centres and innovation labs.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Monitor the defined machine safety zone.",
          "Detect unauthorized/inappropriate access during operation.",
          "Detect fire, smoke and abnormal temperature.",
          "Provide appropriate laser-radiation monitoring for the machine's wavelength.",
          "Generate immediate visual and audible warnings.",
          "Interface with an emergency-stop/safety-interlock mechanism where appropriate.",
          "Maintain safety-event logs.",
          "Provide an authorized monitoring dashboard.",
          "Implement fail-safe behaviour during sensor, communication or power failures.",
        ],
      },
    ],
  },
  {
    id: "SKIT015",
    title: "IoT-Based Smart LPG Cylinder Monitoring and Automatic Safety Control",
    theme: "iot",
    description: [
      "Domestic and commercial LPG cylinders involve safety risks such as gas leakage, excessive temperature, abnormal pressure conditions and unattended usage. Conventional LPG systems generally depend on manual observation and do not provide continuous monitoring or automatic safety intervention.",
      "Develop an IoT-enabled smart LPG cylinder monitoring and safety system capable of continuously monitoring cylinder-related parameters and detecting potentially hazardous conditions.",
    ],
    sections: [
      {
        heading: "Proposed system should",
        items: [
          "Monitor LPG cylinder weight to estimate remaining gas.",
          "Detect LPG leakage using an appropriate gas sensor.",
          "Monitor surrounding/cylinder temperature.",
          "Identify abnormal conditions or rapid gas-consumption patterns.",
          "Generate local audible/visual alerts.",
          "Automatically activate a safety mechanism such as a valve shut-off where technically feasible.",
          "Send real-time alerts to a mobile/web application.",
          "Maintain historical consumption and safety-event records.",
          "Provide low-gas-level and leakage notifications.",
        ],
      },
    ],
  },
  {
    id: "SKIT016",
    title: "Temperature & Humidity Controlled Smart Cooling Jacket",
    theme: "iot",
    description: [
      "Workers operating in high-temperature environments such as construction sites, industries, laboratories and outdoor locations may experience thermal discomfort and heat stress. A wearable system capable of monitoring environmental and jacket temperature and automatically controlling cooling can improve comfort and working conditions.",
      "Develop a smart wearable cooling jacket with embedded sensing and automatic TEC-based cooling control.",
    ],
    sections: [
      {
        heading: "Proposed system should",
        items: [
          "Measure jacket/body-side temperature.",
          "Measure ambient temperature.",
          "Monitor ambient humidity.",
          "Automatically activate cooling when temperature exceeds a predefined threshold.",
          "Dynamically control cooling intensity based on temperature.",
          "Provide battery-powered operation.",
          "Display temperature/humidity information.",
          "Provide adjustable user-defined temperature thresholds.",
          "Include suitable thermal insulation and heat-dissipation arrangements.",
        ],
      },
    ],
  },
  {
    id: "SKIT017",
    title: "AI & IoT-Enabled Intelligent Waste Management and Resource Recovery",
    theme: "iot",
    description: [
      "Educational campuses generate multiple categories of waste, including biodegradable, recyclable, plastic, paper, e-waste and other materials. Conventional collection systems often focus primarily on disposal rather than segregation, monitoring and resource recovery.",
      "Develop an AI- and IoT-enabled intelligent waste-management system for a college campus.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Monitor bin fill levels using IoT sensors.",
          "Support waste-category identification/segregation.",
          "Generate overflow alerts and collection priorities.",
          "Predict waste-generation patterns.",
          "Support collection planning and resource-recovery tracking.",
          "Provide a campus dashboard and sustainability reports.",
        ],
      },
    ],
  },
  {
    id: "SKIT018",
    title: "AI-Based Road Damage Detection and Severity Mapping",
    theme: "iot",
    description: [
      "Develop an AI-based system that automatically detects and classifies road defects such as potholes, cracks, damaged surfaces and uneven road sections from road images or videos.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Detect potholes, cracks and other road-surface defects.",
          "Classify defects according to type and severity.",
          "Estimate the location of detected defects using available image/video metadata.",
          "Generate a road-condition map.",
          "Prioritize defects based on severity and potential safety impact.",
          "Provide an interactive dashboard for viewing detected road problems.",
          "Support image and video-based analysis.",
          "Provide confidence scores and visual evidence for AI predictions.",
        ],
      },
    ],
  },
  {
    id: "SKIT019",
    title: "Smart Remote Water Supply & Motor Control System",
    theme: "iot",
    description: [
      "In homes, apartments, institutions and commercial establishments, water pumps and water-supply valves are generally operated manually. Users need to be physically present near the motor or water-supply connection to start or stop the water flow. This often results in water wastage, tank overflow, unnecessary electricity consumption, motor damage and inconvenience, especially when users are away from their homes.",
      "The proposed solution is to develop an IoT-based Smart Water Management System that can be integrated with existing water tanks, water pumps and, where permitted, incoming municipal/government water-supply connections. The system will enable users to monitor water-tank levels and remotely control the motor and water-supply valve through a mobile application from anywhere using Wi-Fi or mobile/SIM-based connectivity.",
      "The system should also provide automatic control and alerts based on water level, motor status and predefined conditions. For example, the motor can automatically switch OFF when the tank reaches the desired level, and the user can receive notifications for low water, tank-full conditions, motor failure or connectivity issues.",
      "The solution aims to provide an affordable, scalable and easy-to-install smart water-control system that reduces water wastage, improves convenience and enables efficient management of household and institutional water resources.",
    ],
    sections: [
      {
        heading: "Expected outputs",
        items: [
          "IoT Smart Water Controller capable of controlling existing water pumps.",
          "Water-Level Monitoring System to continuously monitor the water level in the tank.",
          "Mobile Application for remote monitoring and ON/OFF control of the motor.",
          "Remote Water-Supply Valve Control for authorized installations on incoming water-supply connections.",
          "Wi-Fi Connectivity for homes and locations with internet access.",
          "SIM/4G Connectivity for locations where Wi-Fi is unavailable or as backup connectivity.",
          "Automatic Motor Control based on predefined water-level limits.",
          "Tank Overflow Protection by automatically switching OFF the motor when the tank reaches the maximum level.",
          "Motor Status Monitoring to identify whether the motor is actually running after an ON command.",
          "Dry-Run/Fault Detection to protect the motor when water is unavailable or the motor fails.",
        ],
      },
    ],
  },

  // ---------- Robotics, Smart Campus & Digital Applications ----------
  {
    id: "SKIT020",
    title: "AI-Powered Autonomous Search-and-Rescue Drone",
    theme: "campus",
    description: [
      "Develop an AI-enabled drone capable of assisting search-and-rescue teams during floods, earthquakes, landslides and other disaster situations by detecting people and hazards from aerial imagery.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Perform autonomous or semi-autonomous navigation.",
          "Detect survivors using RGB/thermal vision.",
          "Detect hazards such as fire, smoke, debris, floodwater and damaged structures.",
          "Use GPS/IMU and, where feasible, LiDAR/depth sensing.",
          "Support GPS-denied navigation using SLAM/visual perception where feasible.",
          "Generate geo-tagged survivor/hazard information.",
          "Perform critical AI inference locally/at the edge.",
          "Provide a ground-control/command dashboard.",
        ],
      },
    ],
  },
  {
    id: "SKIT021",
    title: "Digital Platform for Centralized Collection, Verification & Management of Student Participation Data",
    theme: "campus",
    description: [
      "Educational institutions conduct numerous academic, technical, cultural, sports and extracurricular activities. Student participation records are often maintained across multiple departments, spreadsheets, certificates and individual systems, making verification and reporting difficult.",
      "Develop a centralized digital platform for collecting, verifying, managing and analyzing student participation data.",
    ],
    sections: [
      {
        heading: "Expected outcome",
        text: "A secure institutional platform that creates a single verified digital record of student participation.",
      },
    ],
  },
  {
    id: "SKIT022",
    title: "Compact Workshop Tool Stand Design Using AutoCAD",
    theme: "campus",
    area: "CAD, Mechanical Design & Digital Manufacturing",
    description: [
      "Workshop tools require appropriately designed stands that provide convenient positioning, efficient use of available space and organized placement of tools. The geometry and arrangement of the stand should satisfy specified dimensional constraints while allowing scope for creative engineering design.",
      "Develop an innovative compact workshop-tool stand using AutoCAD.",
    ],
    sections: [],
    constraint: "AutoCAD should be the primary/exclusive design tool. Structural simulation, programming, AI and IoT are not required for this PS.",
  },
  {
    id: "SKIT023",
    title: "Smart Campus, Facial Recognition and Mobile Application Development",
    theme: "campus",
    description: [
      "Staff currently mark attendance using a system installed at the college’s main gate. During morning hours, vehicles gather near the gate, causing traffic congestion and delays.",
      "The college requires a mobile attendance application that allows staff to mark attendance from their phones after entering the campus.",
    ],
    sections: [
      {
        heading: "The system must",
        items: [
          "Capture a live image using the phone’s camera.",
          "Prevent photo uploads from the gallery.",
          "Verify the staff member’s face.",
          "Confirm that the user is connected to campus Wi-Fi or is within the approved campus area (within the fixed range of longitude and latitude).",
          "Prevent attendance from outside the college or through proxy users.",
        ],
      },
      {
        heading: "Expected outcome",
        text: "A secure mobile application that reduces congestion at the college gate while ensuring that only staff physically present on campus can mark attendance.",
      },
    ],
  },
  {
    id: "SKIT024",
    title: "AI-Based Document Intelligence and Information Extraction System",
    theme: "campus",
    description: [
      "Develop an AI-powered document intelligence platform capable of extracting, classifying and summarizing information from unstructured documents such as forms, certificates, invoices, reports and institutional records.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Accept PDF, image and scanned-document inputs.",
          "Perform OCR where required.",
          "Identify document types automatically.",
          "Extract predefined fields and important entities.",
          "Handle different document layouts.",
          "Detect missing or inconsistent information.",
          "Generate concise document summaries.",
          "Allow users to search extracted information.",
          "Provide confidence scores and source references for extracted information.",
        ],
      },
    ],
  },
  {
    id: "SKIT025",
    title: "AI-Based Phishing, Scam Message and Malicious URL Detection",
    theme: "campus",
    description: [
      "Develop an AI-based system that identifies potentially malicious emails, SMS messages, social-media messages and URLs associated with phishing, scams or other deceptive online activities.",
    ],
    sections: [
      {
        heading: "Expected solution should",
        items: [
          "Analyze message text and URLs.",
          "Identify suspicious linguistic patterns.",
          "Extract and analyze URLs, domains and relevant metadata.",
          "Detect impersonation and urgency-based scam patterns.",
          "Classify messages according to risk level.",
          "Explain the factors contributing to the risk classification.",
          "Provide warnings before users interact with suspicious content.",
          "Maintain a searchable history of analyzed cases.",
          "Provide a dashboard for security analysis.",
        ],
      },
    ],
  },
];

export const PS_COUNT = PROBLEM_STATEMENTS.length;
export const PS_THEME_COUNT = PS_THEMES.length;

export const themeOf = (id: ThemeId) => PS_THEMES.find((t) => t.id === id)!;
