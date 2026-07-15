import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  breadcrumbs, 
  showBack, 
  backHref = "/",
  actions 
}: PageHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <div className="mb-8">
      {(showBack || breadcrumbs) && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          {showBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-muted-foreground hover:text-white -ml-2"
              onClick={() => navigate(backHref)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-muted-foreground">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white mb-1">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
