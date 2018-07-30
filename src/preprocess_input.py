import pandas as pd

geolocation = pd.read_csv('../data/uscitiesv1.4.csv')
geolocation = geolocation[['city', 'state_name', 'lat', 'lng']]
population = pd.read_excel('../data/cities.xlsx')

merged_df = pd.merge(
    population, geolocation,
    how='left', left_on=['city', 'state'], right_on=['city', 'state_name']
)

print(merged_df.head())

merged_df.to_csv('../data/merged.csv')
