export interface OpportunityRow {
  id: string;
  title: string;
  description: string;
  type: 'hackathon' | 'internship' | 'event' | 'gig';
  tags: string[];
  link: string | null;
  deadline: Date | null;
  posted_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublicOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'hackathon' | 'internship' | 'event' | 'gig';
  tags: string[];
  link: string | null;
  deadline: Date | null;
  postedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}
