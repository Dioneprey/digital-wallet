"use client";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, AutocompleteOption } from "./ui/autocomplete";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUsersByEmail } from "@/services/user";
import { FormErrors } from "@/common/interfaces/form-response.interface";

interface UsersAutocompleteProps {
  selectedValue?: string;
  onValueChange: (value: string) => void;
  setErrors: (value: FormErrors) => void;
}

export function UsersAutocomplete({
  onValueChange,
  setErrors,
  selectedValue,
}: UsersAutocompleteProps) {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(handler);
  }, [value]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", debouncedValue],
    queryFn: () =>
      fetchUsersByEmail({
        email: debouncedValue,
      }),
    enabled: debouncedValue?.length > 3,
  });

  const userOptions: AutocompleteOption[] = data?.users
    ? data?.users?.map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
        searchValue: `${user.name} ${user.email} ${user.id}`,
      }))
    : [];

  return (
    <Autocomplete
      options={userOptions}
      value={selectedValue}
      onValueChange={(e) => {
        onValueChange(e);
      }}
      emptyMessage={
        debouncedValue?.length < 3 ? "Busque usuários pelo email" : undefined
      }
      loading={isLoading || isFetching}
      onSearchValueChange={(value) => setValue(value)}
      icon={<User className="h-4 w-4 text-muted-foreground" />}
      renderOption={(option) => {
        const user = data?.users.find((u) => u.email === option.value);
        return user ? (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        ) : (
          <span>{option.label}</span>
        );
      }}
    />
  );
}
