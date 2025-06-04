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
}

export default function DynamicFormGenerator({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save Configuration"
}: DynamicFormGeneratorProps) {
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  
  // Group fields by their group property
  const primaryFields = fields.filter(field => field.group === "primary" || !field.group);
  const advancedFields = fields.filter(field => field.group === "advanced");
  
  // Create dynamic Zod schema based on field definitions
  const createDynamicSchema = (fields: FormFieldType[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (field.type) {
        case 'text':
        case 'dropdown':
          fieldSchema = z.string();
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
          }
          break;
          
        case 'textarea':
          fieldSchema = z.string();
          break;
          
        case 'number':
          fieldSchema = z.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max);
          }
          break;
          
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
          
        case 'multiselect':
          fieldSchema = z.array(z.string());
          break;
          
        default:
          fieldSchema = z.string();
      }
      
      if (field.required) {
        if (field.type === 'text' || field.type === 'textarea' || field.type === 'dropdown') {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      if (field.defaultValue !== undefined) {
        fieldSchema = fieldSchema.default(field.defaultValue);
      }
      
      schemaFields[field.id] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const dynamicSchema = createDynamicSchema(fields);
  
  // Create default values combining field defaults with initial values
  const getDefaultValues = () => {
    const defaults: Record<string, any> = {};
    
    fields.forEach(field => {
      if (initialValues[field.id] !== undefined) {
        defaults[field.id] = initialValues[field.id];
      } else if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      } else {
        // Set appropriate default based on type
        switch (field.type) {
          case 'checkbox':
            defaults[field.id] = false;
            break;
          case 'multiselect':
            defaults[field.id] = [];
            break;
          case 'number':
            defaults[field.id] = 0;
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
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'text':
                    return (
                      <Input
                        {...formField}
                        placeholder={field.placeholder}
                        value={formField.value || ''}
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
                      />
                    );
                    
                  case 'textarea':
                    return (
                      <Textarea
                        {...formField}
                        placeholder={field.placeholder}
                        value={formField.value || ''}
                        rows={3}
                      />
                    );
                    
                  case 'checkbox':
                    return (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value || false}
                          onCheckedChange={formField.onChange}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {field.label}
                          </label>
                        </div>
                      </div>
                    );
                    
                  case 'dropdown':
                    return (
                      <Select onValueChange={formField.onChange} value={formField.value || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                    
                  case 'multiselect':
                    return (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              checked={(formField.value || []).includes(option.value)}
                              onCheckedChange={(checked) => {
                                const currentValue = formField.value || [];
                                if (checked) {
                                  formField.onChange([...currentValue, option.value]);
                                } else {
                                  formField.onChange(
                                    currentValue.filter((v: string) => v !== option.value)
                                  );
                                }
                              }}
                            />
                            <label className="text-sm font-medium">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    );
                    
                  default:
                    return (
                      <Input
                        {...formField}
                        placeholder={field.placeholder}
                        value={formField.value || ''}
                      />
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Section - Always Visible */}
        {primaryFields.length > 0 && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Define Inventory Group</h3>
              <p className="text-sm text-gray-600 mt-1">Configure basic inventory handling settings</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primaryFields.map(renderField)}
            </div>
          </div>
        )}

        {/* Advanced Section - Expandable */}
        {advancedFields.length > 0 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              {isAdvancedExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium">Advanced Configuration</span>
              <span className="text-sm text-gray-500">
                ({advancedFields.length} additional settings)
              </span>
            </button>
            
            {isAdvancedExpanded && (
              <div className="pl-6 border-l-2 border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advancedFields.map(renderField)}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}