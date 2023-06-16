interface StatusData {
  [key: string]: {
    label: string;
    desc: string;
    btnClass: string;
  };
}

interface LocationData {
  [key: string]: {
    name?: string;
    abbr?: string;
    linkText?: string;
    url?: string;
    btnClass?: string;
    statusText?: string;
  };
}

interface ApiEntry {
  id: string;
  location: {
    code: string;
    name: string;
  };
  status: {
    code: string;
    display: string;
    duedate?: Date;
  };
  holdCount: number;
}

interface ItemType {
  id: string;
  status: string;
  location: string;
}

export {
  StatusData,
  LocationData,
  ApiEntry,
  ItemType,
};
