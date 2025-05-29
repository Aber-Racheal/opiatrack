from django.db import migrations

def seed_default_data(apps, schema_editor):
    IncomeSource = apps.get_model('tracker', 'IncomeSource')
    ExpenseCategory = apps.get_model('tracker', 'ExpenseCategory')

    default_income_sources = ['Salary', 'Business', 'Agriculture', 'Livestock', 'Remittances', 'Crafts & Artisanal Work', 'Transport Services', 'NGO or Aid Work', 'Government Stipends', 'Pension', 'Seasonal Employment', 'Food Stalls', 'Fishing', 'Forestry & Timber', 'Construction Work', 'Brick Making', 'Tourism & Hospitality', 'Mining', 'Handicrafts (e.g., beadwork, carvings)', 'Farming (cash crops: maize, beans, groundnuts, cassava)', 'Fruit Selling', 'Cattle Trade', 'Bee Keeping (Honey Production)', 'Domestic Service (housekeeping, caretaking)', 'Local Trade (selling in local markets)', 'Carpentry', 'Tailoring & Sewing', 'Boda-Boda (motorcycle taxi)', 'Mobile Money Agent Services']
    default_expense_categories = ['Rent', 'Groceries', 'Utilities', 'Healthcare', 'Transport', 'Education', 'Agricultural Inputs', 'Livestock Care', 'Community Contributions', 'Mobile Phone & Communication', 'Social and Religious Tithing', 'Food Storage & Preservation', 'Fuel (for transport, farming equipment)', 'Water Costs (e.g., purchasing water, water fetching)', 'Medical Treatment (doctor visits, clinics)', 'School Supplies (books, uniforms, fees)', 'Bank Fees', 'Insurance (health, property, life)', 'Electricity (solar, off-grid alternatives)', 'Household Maintenance (repairing homes, buying tools)', 'Legal Fees (for land disputes, contracts)', 'Building Materials', 'Family Celebrations (weddings, funerals, holidays)', 'Interest on Loans', 'Tithing to Local Church or Mosque', 'Savings & Investment Contributions', 'Childcare Costs', 'Clothing & Footwear', 'Cleaning Supplies', 'Entertainment & Socializing (local events, music, dance)', 'Transport Costs (e.g., matatus, personal vehicle)', 'Internet/Data Costs']

    for name in default_income_sources:
        IncomeSource.objects.create(name=name, user=None)

    for name in default_expense_categories:
        ExpenseCategory.objects.create(name=name, user=None)

class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0001_initial'),  # Make sure this is correct!
    ]

    operations = [
        migrations.RunPython(seed_default_data),
    ]
