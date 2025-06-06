import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FormField as FormFieldType } from '@shared/framework-config';

interface DynamicFormGeneratorProps {
  fields: FormFieldType[];
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  frameworkConfig?: any;
}

export default function DynamicFormGenerator({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save Configuration",
  frameworkConfig
}: DynamicFormGeneratorProps) {
  // Group fields by their group property
  const primaryFields = fields.filter(field => field.group === "primary" || !field.group);
  
  // Get all non-primary groups and create expandable sections
  const expandableGroups = Array.from(new Set(
    fields
      .filter(field => field.group && field.group !== "primary")
      .map(field => field.group!)
      .filter(group => group != null && group !== undefined)
  ));
  
  // State for tracking which expandable sections are open
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Function to generate human-readable titles from group names
  const generateGroupTitle = (groupName: string): string => {
    if (!groupName || typeof groupName !== 'string') {
      return 'Untitled Group';
    }
    return groupName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Toggle expansion state for a specific group
  const toggleSection = (groupName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Create dynamic Zod schema based on field definitions
  const createDynamicSchema = (fields: FormFieldType[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          if (field.validation?.pattern) {
            const stringSchema = fieldSchema as z.ZodString;
            fieldSchema = stringSchema.regex(new RegExp(field.validation.pattern));
          }
          break;
        case 'number':
          fieldSchema = z.number();
          if (field.validation?.min !== undefined) {
            const numberSchema = fieldSchema as z.ZodNumber;
            fieldSchema = numberSchema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            const numberSchema = fieldSchema as z.ZodNumber;
            fieldSchema = numberSchema.max(field.validation.max);
          }
          break;
        case 'dropdown':
        case 'select':
          fieldSchema = z.string();
          break;
        case 'multiselect':
          fieldSchema = z.array(z.string());
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaFields[field.id] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const dynamicSchema = createDynamicSchema(fields);
  
  // Generate default values based on field definitions
  const getDefaultValues = () => {
    const defaults: Record<string, any> = { ...initialValues };
    
    fields.forEach(field => {
      if (defaults[field.id] === undefined && field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      } else if (defaults[field.id] === undefined) {
        switch (field.type) {
          case 'checkbox':
            defaults[field.id] = false;
            break;
          case 'number':
            defaults[field.id] = 0;
            break;
          case 'multiselect':
            defaults[field.id] = [];
            break;
          default:
            defaults[field.id] = '';
        }
      }
    });
    
    return defaults;
  };

  const form = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: getDefaultValues(),
  });

  const renderField = (field: FormFieldType) => {
    return (
      <FormField
        key={field.id}
        control={form.control}
        name={field.id}
        render={({ field: formField }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium text-gray-600 leading-tight">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'text':
                    return (
                      <Input
                        {...formField}
                        placeholder={field.placeholder}
                        value={formField.value || ''}
                        className="h-7 text-xs px-2 py-1"
                      />
                    );
                    
                  case 'number':
                    return (
                      <Input
                        {...formField}
                        type="number"
                        placeholder={field.placeholder}
                        value={formField.value || ''}
                        onChange={(e) => formField.onChange(Number(e.target.value))}
                        className="h-7 text-xs px-2 py-1"
                        min={field.validation?.min}
                        max={field.validation?.max}
                      />
                    );
                    
                  case 'textarea':
                    return (
                      <Textarea
                        {...formField}
                        placeholder={field.placeholder}
                        value={formField.value || ''}
                        rows={2}
                        className="text-xs px-2 py-1 resize-none min-h-[3rem]"
                      />
                    );
                    
                  case 'checkbox':
                    return (
                      <div className="flex items-center space-x-1.5 h-7">
                        <Checkbox
                          checked={formField.value || false}
                          onCheckedChange={formField.onChange}
                          className="h-3 w-3"
                        />
                        <span className="text-xs text-gray-600 leading-tight">
                          {field.explainer || 'Enable this option'}
                        </span>
                      </div>
                    );
                    
                  case 'dropdown':
                  case 'select':
                    return (
                      <Select onValueChange={formField.onChange} value={formField.value}>
                        <SelectTrigger className="h-7 text-xs px-2 py-1">
                          <SelectValue placeholder={field.placeholder || "Select..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                    
                  case 'multiselect':
                    const selectedValues = Array.isArray(formField.value) ? formField.value : [];
                    return (
                      <div className="space-y-1">
                        {field.options?.map((option) => (
                          <div key={option.value} className="flex items-center space-x-1.5">
                            <Checkbox
                              checked={selectedValues.includes(option.value)}
                              onCheckedChange={(checked) => {
                                let newValues = [...selectedValues];
                                if (checked) {
                                  if (!newValues.includes(option.value)) {
                                    newValues.push(option.value);
                                  }
                                } else {
                                  newValues = newValues.filter(v => v !== option.value);
                                }
                                formField.onChange(newValues);
                              }}
                              className="h-3 w-3"
                            />
                            <span className="text-xs text-gray-600 leading-tight">
                              {option.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                }
              })()}
            </FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Primary Section - Always Visible */}
        {primaryFields.length > 0 && (
          <div className="space-y-2">
            <div className="border-b border-gray-200 pb-1">
              <h3 className="text-base font-semibold text-gray-900">
                {frameworkConfig?.ui?.messages?.forms?.primarySection?.title || "Define Inventory Group"}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {frameworkConfig?.ui?.messages?.forms?.primarySection?.description || "Configure basic inventory handling settings"}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2">
              {primaryFields.map((field) => renderField(field))}
            </div>
          </div>
        )}

        {/* Multiple Expandable Sections */}
        {expandableGroups.map(groupName => {
          const groupFields = fields.filter(field => field.group === groupName);
          const isExpanded = expandedSections[groupName] || false;
          
          return (
            <div key={groupName} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleSection(groupName)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span className="text-sm font-medium">{generateGroupTitle(groupName)}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({groupFields.length} fields)
                </span>
              </button>
              
              {isExpanded && (
                <div className="pl-3 border-l-2 border-gray-200 space-y-1">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2">
                    {groupFields.map((field) => renderField(field))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel} className="h-7 text-xs px-3">
            {frameworkConfig?.ui?.buttons?.cancel || "Cancel"}
          </Button>
          <Button type="submit" disabled={isLoading} className="h-7 text-xs px-3">
            {isLoading ? (frameworkConfig?.ui?.messages?.saving || 'Saving...') : (submitLabel || frameworkConfig?.ui?.buttons?.save || "Save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}