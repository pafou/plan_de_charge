#!/bin/zsh


# Execute all SQL files in the sql directory with the 99_ prefix
for file in ./delete.sql ./10*.sql ./99_*.sql; do
  echo 
  echo "Executing $file..."
  psql -U pascal -d pdc -f "$file"
  if [ $? -ne 0 ]; then
    echo "Error executing $file"
    exit 1
  else
  echo "next ?"
  read rien 
  fi
done

echo "All SQL files executed successfully."
