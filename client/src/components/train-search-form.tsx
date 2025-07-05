import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Train, ArrowUpDown } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  fromStation: z.string().min(1, { message: "Source station is required" }),
  toStation: z.string().min(1, { message: "Destination station is required" }),
  journeyDate: z.date({ required_error: "Journey date is required" }),
  travelClass: z.string().optional(),
  flexibleDates: z.boolean().default(false),
  divyangConcession: z.boolean().default(false),
  railwayPassConcession: z.boolean().default(false),
});

type TrainSearchFormValues = z.infer<typeof formSchema>;

type Station = {
  id: number;
  code: string;
  name: string;
  city: string;
};

interface TrainSearchFormProps {
  onSearch: (values: TrainSearchFormValues) => void;
}

export default function TrainSearchForm({ onSearch }: TrainSearchFormProps) {
  const { toast } = useToast();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Get stations for autocomplete
  const { data: stations = [] } = useQuery<Station[]>({
    queryKey: ["/api/stations"],
  });

  const form = useForm<TrainSearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromStation: "",
      toStation: "",
      journeyDate: new Date(),
      travelClass: "SL",
      flexibleDates: false,
      divyangConcession: false,
      railwayPassConcession: false,
    },
  });

  const handleSubmit = (values: TrainSearchFormValues) => {
    onSearch(values);
  };

  const swapStations = () => {
    const fromStation = form.getValues("fromStation");
    const toStation = form.getValues("toStation");
    
    form.setValue("fromStation", toStation);
    form.setValue("toStation", fromStation);
  };

  return (
    <div className="container mx-auto px-4 -mt-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              {/* From station */}
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="fromStation"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From</FormLabel>
                      <Popover open={fromOpen} onOpenChange={setFromOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Train className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Source Station"
                                className="pl-10"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  setFromOpen(true);
                                }}
                              />
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search stations..." />
                            <CommandList>
                              <CommandEmpty>No stations found.</CommandEmpty>
                              <CommandGroup>
                                {stations
                                  .filter(station => 
                                    station.code.toLowerCase().includes(field.value.toLowerCase()) || 
                                    station.name.toLowerCase().includes(field.value.toLowerCase()) ||
                                    station.city.toLowerCase().includes(field.value.toLowerCase())
                                  )
                                  .slice(0, 8)
                                  .map((station) => (
                                    <CommandItem
                                      key={station.id}
                                      value={station.code}
                                      onSelect={(value) => {
                                        field.onChange(value);
                                        setFromOpen(false);
                                      }}
                                    >
                                      <div>
                                        <div className="font-medium">{station.code} - {station.name}</div>
                                        <div className="text-xs text-gray-500">{station.city}</div>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* To station */}
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="toStation"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To</FormLabel>
                      <Popover open={toOpen} onOpenChange={setToOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Train className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Destination Station"
                                className="pl-10"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  setToOpen(true);
                                }}
                              />
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search stations..." />
                            <CommandList>
                              <CommandEmpty>No stations found.</CommandEmpty>
                              <CommandGroup>
                                {stations
                                  .filter(station => 
                                    station.code.toLowerCase().includes(field.value.toLowerCase()) || 
                                    station.name.toLowerCase().includes(field.value.toLowerCase()) ||
                                    station.city.toLowerCase().includes(field.value.toLowerCase())
                                  )
                                  .slice(0, 8)
                                  .map((station) => (
                                    <CommandItem
                                      key={station.id}
                                      value={station.code}
                                      onSelect={(value) => {
                                        field.onChange(value);
                                        setToOpen(false);
                                      }}
                                    >
                                      <div>
                                        <div className="font-medium">{station.code} - {station.name}</div>
                                        <div className="text-xs text-gray-500">{station.city}</div>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Swap stations button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={swapStations}
                className="hidden md:flex h-10 w-10 rounded-full"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>

              {/* Date picker */}
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="journeyDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Journey</FormLabel>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal pl-10"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setCalendarOpen(false);
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Class selection */}
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="travelClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SL">Sleeper (SL)</SelectItem>
                          <SelectItem value="3A">AC 3 Tier (3A)</SelectItem>
                          <SelectItem value="2A">AC 2 Tier (2A)</SelectItem>
                          <SelectItem value="1A">AC First Class (1A)</SelectItem>
                          <SelectItem value="CC">Chair Car (CC)</SelectItem>
                          <SelectItem value="EC">Executive Class (EC)</SelectItem>
                          <SelectItem value="2S">Second Sitting (2S)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Search button */}
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                Search
              </Button>
            </div>

            {/* Additional search options */}
            <div className="mt-4 flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="flexibleDates"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Flexible with date</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="divyangConcession"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Divyaang Concession</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="railwayPassConcession"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Railway pass concession</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
