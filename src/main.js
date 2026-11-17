import { 
  getCreatures, 
  getCreaturesByType, 
  searchCreatures, 
  searchCreaturesByTypeAndQuery, 
  createCreature, 
  getTeam, 
  addToTeam, 
  removeFromTeam 
} from "./services/api.js";
import { cardsRender, renderDeck, updateTeamCount, showCardDetails, showLoading, hideLoading, showEmptyState} from "./ui.js";

let allCards = [];
let currentTeam = [];

async function startup() {
  showLoading();
  try {
    allCards = await getCreatures();
    currentTeam = await getTeam();
    
    renderDeck(currentTeam); 
    updateTeamCount();

    let savedFilter = localStorage.getItem("selectedFilter") || "Tous";
    let filterEl = document.querySelector("#filter");
    
    if (filterEl) {
      filterEl.value = savedFilter;
      if (savedFilter === "Tous") {
        cardsRender(allCards);
      } else {
        let filtered = await getCreaturesByType(savedFilter);
        cardsRender(filtered);
      }
    } else {
      cardsRender(allCards);
    }
  } catch (error) {
    console.error("Error:", error);
    showEmptyState();
  } finally {
    hideLoading();
  }
}

startup();

const cards = document.querySelector("#Ccards");

let filter = document.querySelector("#filter");
let enabledFilter = false;
let filterValue = [];

filter.addEventListener("change", async (event) => {
  let selectedType = event.target.value;
  localStorage.setItem("selectedFilter", selectedType);
  
  showLoading();
  try {
    if(selectedType == "Tous") {
      cardsRender(allCards);
      enabledFilter = false;
    } else {
      filterValue = await getCreaturesByType(selectedType);
      cardsRender(filterValue);
      enabledFilter = true;
    }
  } catch (error) {
    showEmptyState();
  } finally {
    hideLoading();
  }
});

let search = document.querySelector("#search");
let filterSelect = document.querySelector("#filter");
let sortSelect = document.querySelector("#sort");

search.addEventListener("keydown", async (event) => {
  if(event.key != "Enter") return;
  showLoading();
  let query = event.target.value.toLowerCase().trim();
  
  if(!query){
    hideLoading();
    cardsRender(allCards);
    return;
  }
  
  let currentType = filterSelect ? filterSelect.value : "Tous";

  try {
    let match = [];
    if (currentType && currentType !== "Tous") {
      match = await searchCreaturesByTypeAndQuery(currentType, query);
    } else {
      match = await searchCreatures(query);
    }

    hideLoading();
    if(match.length == 0) showEmptyState();
    cardsRender(match);
  } catch (error) {
    hideLoading();
    showEmptyState();
  }
  
  if (filterSelect && currentType === "Tous") filterSelect.value = "Tous"; 
  if (sortSelect) sortSelect.value = "id";
});

let sort = document.querySelector("#sort");
sort.addEventListener('change', (event) => {
   let value = event.target.value;
   let sorted = [];
   if(enabledFilter == true) {
    sorted = [...filterValue];
   } else {
    sorted = [...allCards];
   }
   

   if (value != "id") {
     sorted.sort((a, b) => {
       let rawA = (value == "attack" || value == "defence") ? Number(a.stats[value]) : Number(a[value]);
       let rawB = (value == "attack" || value == "defence") ? Number(b.stats[value]) : Number(b[value]);
       let valA = rawA || 0;
       let valB = rawB || 0;
       return valB - valA;
     });
   }
   cardsRender(sorted);
});

cards.addEventListener('click', (event) => {
    if (event.target.closest('button') && event.target.closest('button').classList.contains('card-btn') || event.target.closest(".fav-icon")) {
      return; 
    }

    const article = event.target.closest('article');
    if (!article) return;

    const cardId = article.querySelector('span').textContent.trim();
    const selectedCard = allCards.find(c => String(c.id) === cardId);

    if (selectedCard) {
      showCardDetails(selectedCard);
    }
});

const form = document.querySelector(`#creature-form`);

const regexPatterns = {
    id: /^#\d+$/,                     
    name: /^[a-zA-Z\s]{2,30}$/, 
    type: /^(Effect|LIGHT|Fusion|DARK|EARTH|WATER)$/,  
    level: /^([0-9]|1[0-2])$/,  
    attack: /^([0-9]|[1-9][0-9]{1,2}|[1-4][0-9]{3}|5000)$/,               
    defence: /^([0-9]|[1-9][0-9]{1,2}|[1-4][0-9]{3}|5000)$/,
    image: /^https?:\/\/.+\.(png|jpg|jpeg|webp|gif)$/i,         
    description: /^[\s\S]{10,200}$/  
};

const errorMessages = {
    id: "The format must be # followed by 3 digits (e.g., #010...)",
    name: "The name must contain only letters (2-30 characters).",
    level: "Please enter a valid level.",
    attack: "The attack must be a number between 0 and 5000.",
    defence: "The defence must be a number between 0 and 5000.",
    image: "Please enter a valid image link.",
    description: "The description must contain between 10 and 200 characters."
};

form.addEventListener(`focusout`, (event) => {
  const input = event.target;
  const fieldName = input.name;
  if (!regexPatterns[fieldName]) return;
  validateField(input, fieldName);
});

function validateField(input, fieldName) {
  const pattern = regexPatterns[fieldName];
  const errorSpan = input.nextElementSibling;
  if (input.value == "") {
    if(errorSpan && errorSpan.classList.contains(`error-message`)) {
      input.classList.remove(`border-red-500`, `border-green-500`);
      errorSpan.textContent = "";
    }
  }
  else if (pattern.test(input.value.trim())) {
    input.classList.remove(`border-red-500`);
    input.classList.add(`border-green-500`);
    if(errorSpan && errorSpan.classList.contains(`error-message`)) {
      errorSpan.textContent = "";
    }
    return true;
  } else {
    input.classList.remove(`border-green-500`);
    input.classList.add(`border-red-500`);
    if(errorSpan && errorSpan.classList.contains(`error-message`)) {
       errorSpan.textContent = errorMessages[fieldName];
       errorSpan.style.color = "red";
    }
    return false;
  }
}

form.addEventListener(`submit`, async (event) => {
  event.preventDefault();

  let isFormValid = true;
  Object.keys(regexPatterns).forEach(fieldName => {
    const input = form.elements[fieldName];
    if(input) {
      const isValid = validateField(input, fieldName);
      if(!isValid) isFormValid = false;
    }
  });

  if (!isFormValid) return;

  const formData = new FormData(form);
  const newCard = {
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    level: formData.get("level"),
    stats: { attack: Number(formData.get("attack")), defence: Number(formData.get("defence")) },
    image: formData.get("image"),
    description: formData.get("description")
  };

  try {
    await createCreature(newCard);
    
    allCards = await getCreatures();
    cardsRender(allCards);

    form.reset();
    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.classList.remove('border-green-500', 'border-red-500');
    });
    
    let Ccounts = document.querySelector("#cards-count");
    if(Ccounts) Ccounts.textContent = allCards.length;
  } catch (error) {
    console.error("Failed to add card:", error);
  }
});

cards.addEventListener('click', async (event) => {
  console.log("listener works")
    if (event.target.closest('button') && event.target.closest('button').classList.contains('card-btn')) {
      const button = event.target.closest("button");
      const article = button.closest('article');
      if (!article) return;

      const cardId = article.querySelector('span').getAttribute(`card-id`)
      const selectedCard = allCards.find(c => String(c.id) == String(cardId));
      let currentTeam = await getTeam()
      if(currentTeam.includes(c => String(c.id) == String(cardId)))return

      if (selectedCard) {
        await addToMyCards(selectedCard);
      }
    } 
});

async function addToMyCards(cardData) {
    let currentTeam = await getTeam();
    if (!currentTeam) currentTeam = [];

    if (currentTeam.length >= 6) return;
    
    const isAlreadyAdded = currentTeam.some((d) => String(d.id) === String(cardData.id));
    if (isAlreadyAdded) return;
    
    await addToTeam(cardData);
    
    currentTeam = await getTeam();
    renderDeck(currentTeam); 
    updateTeamCount();
}

const mycardsSection = document.getElementById('mycards');
if (mycardsSection) {
  mycardsSection.addEventListener('click', async (event) => {
    const removeBtn = event.target.closest('button[aria-label="Remove card"]');
    if (!removeBtn) return;

    const cardItem = removeBtn.closest('#card-item');
    if (cardItem) {
      const cardId = cardItem.getAttribute('data-id');
      
      await removeFromTeam(cardId);
      
      let updatedTeam = await getTeam();
      renderDeck(updatedTeam);
      updateTeamCount();
    }
  });
}



