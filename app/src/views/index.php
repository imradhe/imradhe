<!DOCTYPE html>
<html lang="en">
<?php include("views/partials/head.php") ?>
<style>
.timeline {
  position: relative;
  border-left: 2px solid #333;
  padding-left: 10px;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -21px;
  top: 6px;
  width: 20px;
  height: 20px;
  background-color: #000;
  border-radius: 50%;
  border: 4px solid white;
  z-index: 2;
}
/* Force bold rendering */
strong {
  font-weight: 900 !important;
}

.fw-bold {
  font-weight: 900 !important;
}

/* Ensure blockquote text isn’t inheriting a lighter weight */
blockquote,
blockquote * {
  font-weight: inherit;
}

/* If a custom font is being used, make sure bold variant is applied */
body {
  font-synthesis: weight;
}
</style>


<body class="light">
  <div class="d-flex justify-content-center text-center align-items-center">
    <div id="header" class="row g-0 py-3 px-1" style="max-width: 800px;">
      <div class="col-md-8">
        <div class="row p-0 m-0 g-0 align-items-center">
          <div class="col-3 col-sm-2 p-2">
            <img src="<?php echo route('assets/img/imradhe.jpg');?>" class="rounded rounded-circle d-block img-fluid" alt="...">
          </div>
          <div class="col-9 col-sm-10 text-start p-2 pt-3">
            <h1 class="h4 fw-bolder text-capitalize name-flicker" lang="telugu">రాధే శ్యామ్ సాళోపంతుల​ </h1>
            <h6>
              PhD Scholar <br><b>IIIT Hyderabad</b>
            </h6>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="social-icons p-2 pt-4 d-flex justify-content-center align-items-center">
          <a target="_blank" href="https://linkedin.com/in/imradhe" title="LinkedIn - @imradhe"><i class="fs-3 pe-3 bi bi-linkedin mx-1"></i></a>
          <a target="_blank" href="https://github.com/imradhe" title="GitHub - @imradhe"><i class="fs-3 pe-3 bi bi-github mx-1"></i></a>
          <a target="_blank" href="https://instagram.com/imraadhe" title="Instagram - @imraadhe"><i class="fs-3 pe-3 bi bi-instagram mx-1"></i></a>
          <a target="_blank" href="https://twitter.com/imraadhe" title="Twitter - @imraadhe"><i class="fs-3 pe-3 bi bi-twitter mx-1"></i></a>
          <a type="button" data-bs-toggle="modal" data-bs-target="#shareModal" href="#"><i
              class="fs-5 bi bi-share-fill mx-1"></i></a>
        </div>
      </div>
    </div>

  </div>

  <div class="container" style="max-width: 768px;">
    <ul class="nav nav-pills table-responsive py-2" id="myTab" role="tablist">
      <div class="d-flex">
          <li class="nav-item" role="presentation">
            <a href="/" class="nav-link px-3 rounded-pill about-tab" id="about-tab">About</a>
          </li>
          <li class="nav-item" role="presentation">
            <a href="/education" class="nav-link px-3 rounded-pill education-tab" id="skills-tab">Education</a>
          </li>
          <li class="nav-item" role="presentation">
          <li class="nav-item" role="presentation">
            <a href="/skills" class="nav-link px-3 rounded-pill skills-tab" id="skills-tab">Skills</a>
          </li>
          <li class="nav-item" role="presentation">
            <a href="/projects" class="nav-link px-3 rounded-pill projects-tab" id="projects-tab">Projects</a>
          </li>
          <li class="nav-item" role="presentation">
            <a href="/experience" class="nav-link px-3 rounded-pill experience-tab" id="experience-tab">Experience</a>
          </li>
          <li class="nav-item" role="presentation">
            <a href="/interests" class="nav-link px-3 rounded-pill interests-tab" id="interests-tab">Interests</a>
          </li>
          
      <div class="d-none">
          <li class="nav-item" role="presentation">
            <button type="button" role="tabs" class="nav-link px-3 rounded-pill" data-bs-toggle="tab" data-bs-target="#about-tab-pane" id="about-tab">About</button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" role="tabs" class="nav-link px-3 rounded-pill" data-bs-toggle="tab" data-bs-target="#education-tab-pane" id="education-tab">Education</button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" role="tabs" class="nav-link px-3 rounded-pill" data-bs-toggle="tab" data-bs-target="#skills-tab-pane" id="skills-tab">Skills</button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" role="tabs" class="nav-link px-3 rounded-pill" data-bs-toggle="tab" data-bs-target="#experience-tab-pane" id="experience-tab">experience</button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" role="tabs" class="nav-link px-3 rounded-pill" data-bs-toggle="tab" data-bs-target="#projects-tab-pane" id="projects-tab">projects</button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" role="tabs" class="nav-link px-3 rounded-pill" data-bs-toggle="tab" data-bs-target="#interests-tab-pane" id="interests-tab">interests</button>
          </li>
      </div>
      </div>
    </ul>
    
    <div class="tab-content" id="tabs-content">
      <div class="tab-pane fade show active mt-4 px-5" id="about-tab-pane" role="tabpanel" aria-labelledby="about-tab"
        tabindex="0">
          <blockquote class="text-center"><strong><q>Mighty Little Man enroute to pro</q></strong></blockquote>
  
  <strong class="fw-bold">PhD Researcher</strong> in <strong>Computational Linguistics</strong> at <strong>IIIT Hyderabad</strong>, working on rich speech processing and style- and context-aware speech translation for Indian languages.<br><br>Experienced in ASR, TTS, data collection, and low-resource NLP, with hands-on work at AI4Bharat, IIT Madras.<span class="collapse" id="expand"><br><br>Also builds research-driven software tools and products at the intersection of language technology, education, and culture.</span>

<a style="cursor:pointer; text-decoration:underline;" data-bs-toggle="collapse" data-bs-target="#expand"><span onclick="this.style.display='none'">Read More</span></a>

        
        
        <div class="text-center mt-3 mb-5 pb-5">
          <a target="_blank" href="<?php echo route('assets/docs/ImRadheResume.pdf');?>" class="btn btn-dark"><i class="bi bi-download"></i> Download Resume</a>
          
          
          
        </div>
      </div>
      
      
          <div class="tab-pane fade mt-4 px-5" id="education-tab-pane" role="tabpanel" aria-labelledby="education-tab" tabindex="0">
            <div class="timeline education mb-5 pb-5"></div>
        </div>
        
      <div class="tab-pane fade mt-4 px-5" id="skills-tab-pane" role="tabpanel" aria-labelledby="skills-tab"
        tabindex="0">
          
        <b>Areas/Domains</b>
        <p>Speech Synthesis (TTS), Automatic Speech Recognition (ASR), NLP, Product Development in EdTech, AR, and EventTech</p>

<b>Programming Languages</b>
<p>Python, JavaScript, TypeScript, HTML,
CSS/Sass, SQL, NoSQL, PHP, C/C++</p>

<b>Libraries & Frameworks</b> 
<p>Three.js, React, Node.js, Express, Django, Laravel, Angular, Bootstrap</p>

<b>Design</b>
<p>Figma, Photoshop, Illustrator, Canva, UI/UX</p>

<b>Inter-Personal & Cognitive Skills</b>

<p>First-Principles Thinking, Proactiveness, Deep Thinking, Efficient Problem Solving, Branding, Holistic Systems Design</p>
      </div>
      <div class="tab-pane fade mt-4 px-5 projects" id="projects-tab-pane" role="tabpanel" aria-labelledby="projects-tab"
        tabindex="0"></div>
      <div class="tab-pane fade mt-4 px-5" id="experience-tab-pane" role="tabpanel" aria-labelledby="experience-tab"
        tabindex="0"></div>
      <div class="tab-pane fade mt-4 px-5" id="interests-tab-pane" role="tabpanel" aria-labelledby="interests-tab"
        tabindex="0">
        <b>Academic</b>
        <p>Knowledge Modeling, Language Modeling, Sanskrit NLP, Computational Linguistics, Speech Processing, Cultural Preservation, Philosophy & Behavioral Psychology</p>
        <b>Non Academic</b>
        <p>Chess, Carnatic Music, Singing/Songwriting, Music Production</p>
      </div>
    </div>

    <div class="modal fade" id="shareModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
      aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bolder" id="shareModalTitle"><span>Radhe Shyam Salopanthula</span></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <h4>Share my profile!</h4>
            <ul class="social-icons list-inline d-flex justify-content-center text-center mt-3">
              <li class="social-icon mx-2 list-inline-item"><a
                  href="https://wa.me/?text=Radhe Shyam Salopanthula Portfolio.%0A%0Ahttps://imradhe.com/"
                  class="bi bi-whatsapp fs-2" target="_blank"></a></li>
              <li class="social-icon mx-2 list-inline-item"><a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://imradhe.com/&quote=Radhe Shyam Salopanthula Portfolio.%0A%0A"
                  class="bi bi-facebook fs-2" target="_blank"></a></li>
              <li class="social-icon mx-2 list-inline-item"><a
                  href="https://twitter.com/intent/tweet?text=Radhe Shyam Salopanthula Portfolio.%0A%0Ahttps://imradhe.com/"
                  class="bi bi-twitter fs-2" target="_blank"></a></li>
              <li class="social-icon mx-2 list-inline-item"><a
                  href="https://www.linkedin.com/cws/share?url=https://imradhe.com/" class="bi bi-linkedin fs-2"
                  target="_blank"></a></li>
            </ul>
            <div class="input-group">
              <input type="url" class="form-control" id="shareUrl" readonly>
              <button class="btn btn-dark" type="button" id="copyBtn">copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    

    <script>
    
        const aboutButton = document.querySelector("#about-tab");
        const skillsButton = document.querySelector("#skills-tab");
        const projectsButton = document.querySelector("#projects-tab");
        const experienceButton = document.querySelector("#experience-tab");
        const interestsButton = document.querySelector("#interests-tab");
        
        
        const tabs = new bootstrap.Tab('#myTab')

      switch(window.location.pathname){
  
          case "/skills": 
              skills_tab = new bootstrap.Tab(document.querySelector('.skills-tab'));
              skills_tab.show();
              aboutButton.classList.add('.active')
              document.querySelector('#about-tab-pane').innerHTML = document.querySelector('#skills-tab-pane').innerHTML
          break;
          case "/interests": 
              interests_tab = new bootstrap.Tab(document.querySelector('.interests-tab'));
              interests_tab.show();
              skillsButton.classList.add('.active')
              document.querySelector('#about-tab-pane').innerHTML = document.querySelector('#interests-tab-pane').innerHTML
          break;
          

          case "/education":
  const education_tab = new bootstrap.Tab(document.querySelector('.education-tab'));
  education_tab.show();
  document.querySelector("#education-tab").classList.add("active");
  document.querySelector('#about-tab-pane').innerHTML = '<div class="timeline education mb-5 pb-5"></div>';
  const educationContainer = document.querySelector(".education");

  fetch('<?php echo route('assets/docs/education.json'); ?>')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const eduCard = `
          <div class="timeline-item position-relative mb-5">
            <div class="timeline-dot"></div>
            <div class="timeline-content ms-4">
              <h4 class="fw-bold mb-1">${item.institution}</h4>
              <h6 class="mb-1">${item.start} - ${capitalize(item.end)}</h6>
              <h5 class="fw-bolder mb-1">${item.degree}</h5>
              <div class="mb-2">${marked.parse(item.description)}</div>
            </div>
          </div>
        `;
        educationContainer.innerHTML += eduCard;
      });
    })
    .catch(error => console.error("Failed to load education.json:", error));
  break;
case "/experience":
  experience_tab = new bootstrap.Tab(document.querySelector('.experience-tab'));
  experience_tab.show();
  experienceButton.classList.add('active');
  document.querySelector('#about-tab-pane').innerHTML = '<div class="timeline experiences mb-5 pb-5"></div>';
  const experiences = document.querySelector(".experiences");

  fetch('<?php echo route('assets/docs/experience.json'); ?>')
    .then(response => response.json())
    .then(data => {
      const companyMap = {};

      // Group experiences by company
      data.forEach(experience => {
        if (!companyMap[experience.company]) {
          companyMap[experience.company] = [];
        }
        companyMap[experience.company].push(experience);
      });

      Object.entries(companyMap).forEach(([company, roles]) => {
        const isCurrent = roles.some(role => role.end.toLowerCase() === "present");
        const currentLabel = isCurrent ? '<span class="badge bg-dark text-light rounded ms-2">Current</span>' : '';

        roles.sort((a, b) => new Date(b.start) - new Date(a.start));

        const roleHtml = roles.map(role => {
          return `
            <div class="role-block mb-3">
              <h6 class="mb-1">${role.start} - ${capitalize(role.end)}</h6>
              <h5 class="fw-bolder mb-1">${role.position}</h5>
              <div class="mb-2">${marked.parse(role.description)}</div>
            </div>
          `;
        }).join("");

        const companyCard = `
          <div class="timeline-item position-relative mb-5">
            <div class="timeline-dot"></div>
            <div class="timeline-content ms-4">
              <h4 class="company fw-bold mb-1">${company}${currentLabel}</h4>
              ${roleHtml}
            </div>
          </div>
        `;

        experiences.innerHTML += companyCard;
      });
    })
    .catch(error => {
      console.error(error);
    });
  break;


     
case "/projects":
  const projectsTab = new bootstrap.Tab(document.querySelector('.projects-tab'));
  projectsTab.show();
  projectsButton.classList.add('active');

  const aboutTabPane = document.querySelector('#about-tab-pane');
  aboutTabPane.innerHTML = `
    <div id="project-filters" class="mb-3 d-flex flex-wrap gap-2"></div>
    <div class="projects mb-5 pb-5"></div>
  `;

  const filtersContainer = document.querySelector('#project-filters');
  const projects = document.querySelector('.projects');
  projects.innerHTML = "";

  fetch('<?php echo route('assets/docs/projects.json') ?>')
    .then(response => response.json())
    .then(data => {
        const allTags = new Set();
        data.forEach(project => (project.tags || []).forEach(tag => allTags.add(tag)));

        const sortedTags = Array.from(allTags).sort();
        console.log(sortedTags);

      
      // Render filter buttons using Bootstrap Buttons (not badges)
      filtersContainer.innerHTML = `
        <button class="btn btn-sm btn-dark border border-dark active" data-tag="all">All</button>
        ${[...sortedTags].map(tag =>
          `<button class="btn btn-sm btn-outline-dark border border-dark" data-tag="${tag}">${tag}</button>`
        ).join('')}
      `;

      const renderProjects = (filteredTag = "all") => {
        projects.innerHTML = "";

        data
          .filter(project => filteredTag === "all" || (project.tags || []).includes(filteredTag))
          .forEach(project => {
            const linksArray = Object.entries(project.links || {});
            const iconMap = {
              "Website": "bi-globe", "GitHub": "bi-github", "Docs": "bi-journal-text",
              "Demo": "bi-play-circle", "Video": "bi-youtube", "Play Store": "bi-google-play",
              "App Store": "bi-apple", "Colab": "bi-cpu", "Google Colab": "bi-cpu",
              "Research Paper": "bi-file-earmark-text", "Paper": "bi-file-earmark-text",
              "Publication": "bi-file-earmark-text", "Slides": "bi-sliders",
              "ArXiv": "bi-file-earmark-pdf", "HuggingFace": "bi-emoji-smile",
              "Kaggle": "bi-bar-chart", "Semantic Scholar": "bi-mortarboard", "Spotify": "bi-spotify"
            };

            const linksHtml = linksArray.map(([name, url]) => {
              const iconClass = iconMap[name] || "bi-link-45deg";
              return `<a target="_blank" href="${url}" class="btn btn-sm btn-outline-dark me-2 mb-2 d-inline-flex align-items-center">
                        <i class="bi ${iconClass} me-1"></i>${name}</a>`;
            }).join('');


            const cardHtml = `
              <div class="card mb-3 border border-1 shadow-sm position-relative" style="max-width: 768px;">
                <div class="row g-0 align-items-center justify-content-center">
                  <div class="col-md-5">
                    <img src="${project.imageUrl}" class="img-fluid rounded-start" alt="${project.title}">
                  </div>
                  <div class="col-md-7">
                    <div class="card-body">
                      <h5 class="card-title text-dark">${project.title}</h5>
                      <p class="card-text text-dark">${marked.parse(project.description)}</p>
                      <div class="mt-2">${linksHtml}</div>
                    </div>
                  </div>
                </div>
              </div>
            `;
            projects.insertAdjacentHTML("beforeend", cardHtml);
          });
      };

      renderProjects();

      filtersContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          const selectedTag = e.target.getAttribute('data-tag');

          filtersContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('btn-dark', 'text-white', 'active');
            btn.classList.add('btn-outline-dark');
          });

          e.target.classList.remove('btn-outline-dark');
          e.target.classList.add('btn-dark', 'text-white', 'active');

          renderProjects(selectedTag);
        }
      });
    })
    .catch(error => {
      console.error("Failed to load projects.json:", error);
    });

  break;

          default:
              about_tab = new bootstrap.Tab(document.querySelector('.about-tab'));
              about_tab.show();
              aboutButton.classList.add('.active')
              document.querySelector('#about-tab-pane').innerHTML = document.querySelector('#about-tab-pane').innerHTML
              
          break;
      }
      


      var copyBtn = document.querySelector("#copyBtn")
      var shareUrl = document.querySelector("#shareUrl")
      var getUrl = window.location.href
      shareUrl.value = getUrl
      copyBtn.addEventListener('click', function () {
        shareUrl.select()
        shareUrl.setSelectionRange(0, 99999)
        document.execCommand("copy")
        copyBtn.innerHTML = "Copied!"
        setTimeout(function () { copyBtn.innerHTML = "copy" }, 1000)
      })
    </script>
    
    <script>
        const scrollActiveTabToCenter = () => {
    const activeTab = document.querySelector('.nav-link.active');
    const navContainer = activeTab?.closest('.nav');

    if (activeTab && navContainer) {
      const containerRect = navContainer.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const scrollLeft = navContainer.scrollLeft;
      const tabCenterOffset = tabRect.left - containerRect.left + (tabRect.width / 2);
      const containerCenter = containerRect.width / 2;
      const scrollOffset = tabCenterOffset - containerCenter;

      navContainer.scrollTo({
        left: scrollLeft + scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  // Trigger on page load (after tabs are shown based on URL)
  scrollActiveTabToCenter();

  // Also trigger when user manually clicks a tab
  document.querySelectorAll('.nav-link').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(scrollActiveTabToCenter, 100);
    });
  });
  
  function capitalize(str) {
  if (!str) return str;
  const [first, ...rest] = str;
  return first.toUpperCase() + rest.join('').toLowerCase();
}
  
    </script>
<script>
    // Load Sanscript library
const script = document.createElement('script');
script.src = 'https://smruthi.in/test/assets/sanscript/sanscript.js';
document.head.appendChild(script);

// Wait for Sanscript to load
script.onload = function() {
    // Indian language script codes for Sanscript + romanization
    const indianLanguageScripts = [
        'romanization',   // Simple romanization
        'telugu',         // Telugu
        'devanagari',     // Hindi, Marathi, Sanskrit, Nepali, etc.
        'iast',           // IAST romanization
        'tamil',          // Tamil
        'kannada',        // Kannada
        'malayalam',      // Malayalam
        'bengali',        // Bengali, Assamese
        'gujarati',       // Gujarati
        'gurmukhi',       // Punjabi
        'oriya',          // Odia
    ];

    let currentIndex = 0;
    let originalText = '';

    // Simple romanization function
    function simpleRomanization(text, sourceLang) {
        try {
            // First convert to IAST, then simplify
            const iastText = Sanscript.t(text, sourceLang, 'iast');
            
            // Simplify IAST to basic Roman characters
            return iastText
                .replace(/[āàáâãäå]/g, 'a')
                .replace(/[īìíîï]/g, 'i')
                .replace(/[ūùúûü]/g, 'u')
                .replace(/[ēèéêë]/g, 'e')
                .replace(/[ōòóôõö]/g, 'o')
                .replace(/ṅ/g, 'ng')
                .replace(/ṇ/g, 'n')
                .replace(/ñ/g, 'n')
                .replace(/t/g, 'th')
                .replace(/ṭ/g, 't')
                .replace(/ḍ/g, 'd')
                .replace(/ṛ/g, 'r')
                .replace(/ḷ/g, 'l')
                .replace(/ś/g, 'sh')
                .replace(/ṣ/g, 'sh')
                .replace(/ḥ/g, 'h')
                .replace(/ṃ/g, 'n')
                .replace(/[^a-zA-Z\s]/g, ''); // Remove any remaining diacritics
        } catch (error) {
            console.warn('Error in romanization:', error);
            return text;
        }
    }

    function startNameFlicker() {
        const nameElement = document.querySelector('.name-flicker');
        if (!nameElement) {
            console.error('Element with class ".name-flicker" not found');
            return;
        }

        // Store original text
        if (!originalText) {
            originalText = nameElement.innerHTML;
        }

        // Function to cycle through scripts
        function flickerName() {
            const currentScript = indianLanguageScripts[currentIndex];
            
            try {
                // Get source language from lang attribute, default to 'telugu'
                const sourceLang = nameElement.getAttribute('lang') || 'telugu';
                
                if (currentScript === 'romanization') {
                    // Use simple romanization
                    nameElement.innerHTML = simpleRomanization(originalText, sourceLang);
                } else {
                    // Use Sanscript transliteration
                    nameElement.innerHTML = Sanscript.t(originalText, sourceLang, currentScript);
                }
            } catch (error) {
                console.warn(`Error transliterating to ${currentScript}:`, error);
                nameElement.innerHTML = originalText;
            }

            // Move to next script
            currentIndex = (currentIndex + 1) % indianLanguageScripts.length;
        }

        // Start the flickering
        setInterval(flickerName, 2000); // Change every 2 seconds
        
        // Initial call
        flickerName();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startNameFlicker);
    } else {
        startNameFlicker();
    }
};
</script>

    
    <script type="application/ld+json">
{
  "@context": "http://www.schema.org",
  "@type": "Person",
  "@id": "https://imradhe.com",
  "name": "Radhe Shyam Salopanthula",
  "email" : "contact@imradhe.com",
  "alternateName": ["Radhe Shyam IITM", "ImRadhe", "Radhe Shyam"],
  "nationality": "Indian",
  "birthPlace" : {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kovvur",
      "addressRegion": "Andhra Pradesh",
      "addressCountry": "India"
    }
  },
  "gender": "Male",
  "description": "Full-stack Product Developer with experience in building and managing applications, strong problem-solving skills and a passion for expanding my skillset and solving real-world problems. Skilled in multiple programming languages and frameworks, and always looking for new challenges and opportunities.",
  "disambiguatingDescription": "Full-stack Product Developer",
  "worksFor": [
    {
      "@type": "Organization",
      "name": "IIT Madras",
      "employee": {
        "@type": "Person",
        "@id": "https://imradhe.com",
        "jobTitle": "Project Staff",
        "url": "https://iitm.ac.in"
      }
    },
    {
      "@type": "Organization",
      "name": "AI4Bharat",
      "employee": {
        "@type": "Person",
        "@id": "https://imradhe.com",
        "jobTitle": "Language Expert for ASR (Automatic Speech Recognition)",
        "url": "https://ai4bharat.iitm.ac.in"
      }
    }
  ],
  "url": "https://imradhe.com",
  "image": {
    "@type": "ImageObject",
    "contentUrl": "https://imradhe.com/assets/img/imradhe.jpg",
    "caption": "Radhe Shyam Salopanthula"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Kovvur",
    "addressRegion": "Andhra Pradesh",
    "addressCountry": "India"
  },
  "sameAs": [
    "https://twitter.com/imraadhe",
    "https://instagram.com/imraadhe",
    "https://www.facebook.com/imraadhe",
    "https://linkedin.com/in/imradhe",
    "https://github.com/imradhe",
    "https://codepen.io/imradhe/",
    "https://stackoverflow.com/users/18218764/radhe-shyam-salopanthula",
    "https://medium.com/@imradhe",
    "https://imradhe.medium.com/"
  ],
  "alumniOf": [
    {
      "@type": "CollegeOrUniversity",
      "name": "Sri Chandrashekarendra Saraswati Viswa Mahavidyala (SCSVMV)",
      "sameAs": "https://en.wikipedia.org/wiki/Sri_Chandrasekharendra_Saraswathi_Viswa_Mahavidyalaya"
    }
  ],
  "affiliation": [
    {
      "@type": "Organization",
      "name": "IIT Madras",
      "url": "https://iitm.ac.in",
      "sameAs": "https://en.wikipedia.org/wiki/Indian_Institute_of_Technology_Madras"
    }
  ]
}



</script>

</body>

</html>