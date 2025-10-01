<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 min-h-screen">
    
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-edit text-blue-500 mr-3"></i>
                        Modifier le Budget
                    </h1>
                    <p class="text-gray-600 mt-1">Ajustez votre budget mensuel</p>
                </div>
                <a href="/budgets" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition">
                    <i class="fas fa-times mr-2"></i>Fermer
                </a>
            </div>

            <!-- Card Formulaire -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
                
                <% if (error) { %>
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                            <p class="text-red-700"><%= error %></p>
                        </div>
                    </div>
                <% } %>

                <!-- Infos Budget -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Catégorie</p>
                            <p class="text-xl font-bold text-gray-800">
                                <i class="<%= budget.category.icon %>" style="color: <%= budget.category.color %>"></i>
                                <%= budget.category.name %>
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600">Période</p>
                            <p class="text-xl font-bold text-gray-800">
                                <%= budget.month %>/<%= budget.year %>
                            </p>
                        </div>
                    </div>
                </div>

                <form method="POST" action="/budgets/<%= budget.id %>" class="space-y-6">
                    
                    <!-- Montant du Budget -->
                    <div>
                        <label for="amount" class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-coins text-yellow-500 mr-2"></i>
                            Montant du budget *
                        </label>
                        <div class="relative">
                            <input 
                                type="number" 
                                id="amount" 
                                name="amount" 
                                step="0.01"
                                min="0.01"
                                value="<%= budget.amount %>"
                                required
                                class="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition outline-none text-lg font-semibold"
                            >
                            <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">MAD</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            Montant maximum que vous souhaitez dépenser
                        </p>
                    </div>

                    <!-- Seuil d'alerte -->
                    <div>
                        <label for="alertThreshold" class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-bell text-orange-500 mr-2"></i>
                            Seuil d'alerte (%)
                        </label>
                        <div class="flex items-center space-x-4">
                            <input 
                                type="range" 
                                id="alertThreshold" 
                                name="alertThreshold" 
                                min="50"
                                max="100"
                                value="<%= budget.alertThreshold %>"
                                class="flex-1"
                                oninput="document.getElementById('thresholdValue').textContent = this.value + '%'"
                            >
                            <span id="thresholdValue" class="text-2xl font-bold text-orange-500 w-16 text-center"><%= budget.alertThreshold %>%</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            Vous serez alerté lorsque vos dépenses atteignent ce pourcentage
                        </p>
                    </div>

                    <!-- Boutons -->
                    <div class="flex space-x-4 pt-4">
                        <button 
                            type="submit" 
                            class="flex-1 bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transform hover:scale-[1.02] transition shadow-lg"
                        >
                            <i class="fas fa-save mr-2"></i>
                            Enregistrer les modifications
                        </button>
                        <a 
                            href="/budgets" 
                            class="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition text-center"
                        >
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </a>
                    </div>

                </form>

                <!-- Bouton Supprimer -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <form method="POST" action="/budgets/<%= budget.id %>/delete" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')">
                        <button 
                            type="submit" 
                            class="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition"
                        >
                            <i class="fas fa-trash mr-2"></i>
                            Supprimer ce budget
                        </button>
                    </form>
                </div>

            </div>

            <!-- Info Box -->
            <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div class="flex items-start">
                    <i class="fas fa-lightbulb text-yellow-500 text-xl mr-3 mt-1"></i>
                    <div>
                        <p class="text-sm text-yellow-800 font-semibold mb-1">Astuce</p>
                        <p class="text-sm text-yellow-700">
                            La catégorie et la période ne peuvent pas être modifiées. Si vous souhaitez changer ces paramètres, créez un nouveau budget.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>

</body>
</html>