export function renderTemplateContent(
  templateContent: string,
  variables: { customer_name?: string; business_name?: string; agent_name?: string }
): string {
  let rendered = templateContent;
  rendered = rendered.replace(/\{\{customer_name\}\}/g, variables.customer_name || 'Client');
  rendered = rendered.replace(/\{\{business_name\}\}/g, variables.business_name || 'Notre Entreprise');
  rendered = rendered.replace(/\{\{agent_name\}\}/g, variables.agent_name || 'Conseiller');
  return rendered;
}
