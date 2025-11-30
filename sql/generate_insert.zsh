#!/bin/zsh

random_min_max() {
  # Génère une valeur aléatoire entre 202511 et 202712
  gen_value() {
    local year=$((2025 + RANDOM % 3))   # 2025, 2026 ou 2027
    local month=$((1 + RANDOM % 12))    # 01 à 12
    printf "%d%02d" "$year" "$month"
  }

  local min=$(gen_value)
  local max=$(gen_value)

  # S'assurer que min < max
  if [[ $min -ge $max ]]; then
    # Swap values to ensure min < max
    local tmp=$min
    min=$max
    max=$tmp

    # Add some random months to max to ensure it's greater than min
    local min_year=${min:0:4}
    local min_month=${min:4:2}
    local target_month=$((min_month + 1 + RANDOM % 12))
    local target_year=$min_year

    if [[ $target_month -gt 12 ]]; then
      target_month=$((target_month - 12))
      target_year=$((target_year + 1))
    fi

    max=$(printf "%d%02d" "$target_year" "$target_month")
  fi

  echo "min=$min max=$max"
}

list_values_with_random() {
  local min=$1
  local max=$2
  local pers=$3
  local subject=$4

  # Extraire année et mois des bornes
  local min_year=${min:0:4}
  local min_month=${min:4:2}
  local max_year=${max:0:4}
  local max_month=${max:4:2}

  local year=$min_year
  local month=$min_month

  while [[ $year -lt $max_year || ( $year -eq $max_year && $month -le $max_month ) ]]; do
    # Formater la valeur 202NMM
    local value=$(printf "%d%02d" "$year" "$month")
    # Générer un entier aléatoire entre 1 et 13
    local rand=$((1 + RANDOM % 13))
    echo "INSERT INTO t_pdc (id_pers, id_subject, month, load) VALUES (" $pers ", " $subject "," $value "," $rand ") ;"


    # Incrémenter le mois
    month=$((month + 1))
    if [[ $month -gt 12 ]]; then
      month=1
      year=$((year + 1))
    fi
  done
}

for  pers in 666 222 2222 777 7772 7998 7225 2225
do
  for subject in 1 2 3  4 5 6
  do
    # Execute list_values_with_random with the result from random_min_max
    result=$(random_min_max)
    min=$(echo "$result" | cut -d' ' -f1 | cut -d'=' -f2)
    max=$(echo "$result" | cut -d' ' -f2 | cut -d'=' -f2)
    echo "-- list_values_with_random $min $max $pers $subject"
    list_values_with_random $min $max $pers $subject
  done
done
