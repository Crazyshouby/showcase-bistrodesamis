
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  defaultTab?: string;
}

export const AdminTabs = ({ tabs, defaultTab }: AdminTabsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue={defaultTab || tabs[0].id} className="w-full">
      <TabsList className={`bg-bistro-sand w-full ${isMobile ? 'justify-between' : 'justify-start'} mb-6 md:mb-8 py-2 h-auto`}>
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id}
            className="data-[state=active]:bg-bistro-olive data-[state=active]:text-white flex-1 md:flex-none text-sm md:text-base py-1.5"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
