document.addEventListener('DOMContentLoaded', function() {
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.querySelector('.container');
    
    // Clear any previous results
    document.getElementById('result').innerHTML = '';
    
    // Initially hide the main content
    mainContent.style.opacity = '0';

    // Add click event to the intro screen
    introScreen.addEventListener('click', function() {
        introScreen.classList.add('hidden');
        mainContent.style.opacity = '1';
    });
});

async function generateRecipe() {
    const ingredients = document.getElementById('ingredients').value;
    const cookingMethod = document.getElementById('cooking-method').value;
    const dietaryPreference = document.getElementById('dietary-preference').value;
    const spiceLevel = document.getElementById('spice-level').value;
    
    const button = document.getElementById('generate-btn');
    const buttonText = button.querySelector('.btn-text');
    const loader = button.querySelector('.loader');
    
    // Show loading state
    buttonText.style.display = 'none';
    loader.style.display = 'block';
    button.disabled = true;

    try {
        const response = await fetch('/.netlify/functions/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ingredients,
                cookingMethod,
                dietaryPreference,
                spiceLevel
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate recipe');
        }

        // Parse and format the recipe
        const formattedRecipe = formatRecipe(data.recipe);
        document.getElementById('result').innerHTML = formattedRecipe;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `
            <div class="error-message">
                ${error.message || 'Failed to generate recipe. Please try again.'}
            </div>
        `;
    } finally {
        // Reset button state
        buttonText.style.display = 'block';
        loader.style.display = 'none';
        button.disabled = false;
    }
}

function formatRecipe(recipeText) {
    // Split the recipe into sections
    const sections = recipeText.split('\n\n');
    let title, cookingTime, spiceLevel, ingredients, method, notes;
    
    sections.forEach(section => {
        if (section.startsWith('TITLE:')) title = section.replace('TITLE:', '').trim();
        if (section.includes('COOKING TIME:')) cookingTime = section.match(/COOKING TIME: (.*)/)[1];
        if (section.includes('SPICE LEVEL:')) spiceLevel = section.match(/SPICE LEVEL: (.*)/)[1];
        if (section.startsWith('INGREDIENTS:')) ingredients = section.split('\n').slice(1);
        if (section.startsWith('METHOD:')) method = section.split('\n').slice(1);
        if (section.startsWith('NOTES:')) notes = section.replace('NOTES:', '').trim();
    });

    return `
        <div class="recipe-card">
            <h2 class="recipe-title">${title}</h2>
            
            <div class="recipe-meta">
                <div class="meta-item">
                    <span>⏱️ Cooking Time:</span>
                    <strong>${cookingTime}</strong>
                </div>
                <div class="meta-item">
                    <span>🌶️ Spice Level:</span>
                    <strong>${spiceLevel}</strong>
                </div>
            </div>

            <div class="ingredients-list">
                <h3>Ingredients</h3>
                <ul>
                    ${ingredients.map(ingredient => `<li>• ${ingredient.trim()}</li>`).join('')}
                </ul>
            </div>

            <div class="method-steps">
                <h3>Method</h3>
                <ol>
                    ${method.map(step => `<li>${step.replace(/^\d+\.\s*/, '')}</li>`).join('')}
                </ol>
            </div>

            ${notes ? `
                <div class="recipe-note">
                    <strong>Note:</strong> ${notes}
                </div>
            ` : ''}
        </div>
    `;
}
