# Create the SQLite schema for the dialog system
sql_schema = """
-- Dialog System Database Schema

-- Characters table to store NPC information
CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    portrait_path TEXT,
    voice_type TEXT,
    default_trust INTEGER DEFAULT 0,
    default_friendship INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dialog trees table to store dialog definitions
CREATE TABLE IF NOT EXISTS dialog_trees (
    id TEXT PRIMARY KEY,
    character_id TEXT,
    title TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id)
);

-- Dialog nodes table to store individual dialog pieces
CREATE TABLE IF NOT EXISTS dialog_nodes (
    id TEXT PRIMARY KEY,
    tree_id TEXT NOT NULL,
    node_key TEXT NOT NULL,
    speaker TEXT,
    text TEXT NOT NULL,
    node_type TEXT DEFAULT 'normal', -- normal, quest, shop, etc.
    voice_file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tree_id) REFERENCES dialog_trees(id),
    UNIQUE(tree_id, node_key)
);

-- Dialog choices table to store conversation choices
CREATE TABLE IF NOT EXISTS dialog_choices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    choice_order INTEGER NOT NULL,
    text TEXT NOT NULL,
    goto_node TEXT,
    condition_expression TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES dialog_nodes(id)
);

-- Choice consequences table to store what happens when choices are selected
CREATE TABLE IF NOT EXISTS choice_consequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    choice_id INTEGER NOT NULL,
    consequence_type TEXT NOT NULL, -- cost, reward, flag, relationship, quest
    target TEXT, -- what's affected (gold, item name, flag name, etc.)
    value_change INTEGER,
    string_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (choice_id) REFERENCES dialog_choices(id)
);

-- Player relationships with characters
CREATE TABLE IF NOT EXISTS character_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    trust_level INTEGER DEFAULT 0,
    friendship_level INTEGER DEFAULT 0,
    romance_level INTEGER DEFAULT 0,
    fear_level INTEGER DEFAULT 0,
    respect_level INTEGER DEFAULT 0,
    last_interaction DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id),
    UNIQUE(player_id, character_id)
);

-- Relationship history for tracking changes
CREATE TABLE IF NOT EXISTS relationship_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    relationship_id INTEGER NOT NULL,
    change_type TEXT NOT NULL, -- trust, friendship, romance, fear, respect
    amount_changed INTEGER NOT NULL,
    reason TEXT,
    dialog_tree_id TEXT,
    choice_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (relationship_id) REFERENCES character_relationships(id),
    FOREIGN KEY (dialog_tree_id) REFERENCES dialog_trees(id),
    FOREIGN KEY (choice_id) REFERENCES dialog_choices(id)
);

-- Global flags for tracking story/game state
CREATE TABLE IF NOT EXISTS global_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    flag_name TEXT NOT NULL,
    flag_value TEXT, -- can store boolean, number, or string as text
    flag_type TEXT DEFAULT 'boolean', -- boolean, integer, string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, flag_name)
);

-- Dialog history to track conversations
CREATE TABLE IF NOT EXISTS dialog_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    dialog_tree_id TEXT NOT NULL,
    node_path TEXT, -- JSON array of visited nodes
    choices_made TEXT, -- JSON array of choice IDs selected
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (dialog_tree_id) REFERENCES dialog_trees(id)
);

-- Quest integration table
CREATE TABLE IF NOT EXISTS quest_dialog_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quest_id TEXT NOT NULL,
    dialog_tree_id TEXT NOT NULL,
    quest_status TEXT, -- available, active, completed, failed
    unlock_condition TEXT, -- condition expression
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dialog_tree_id) REFERENCES dialog_trees(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dialog_nodes_tree_id ON dialog_nodes(tree_id);
CREATE INDEX IF NOT EXISTS idx_dialog_choices_node_id ON dialog_choices(node_id);
CREATE INDEX IF NOT EXISTS idx_choice_consequences_choice_id ON choice_consequences(choice_id);
CREATE INDEX IF NOT EXISTS idx_character_relationships_player_char ON character_relationships(player_id, character_id);
CREATE INDEX IF NOT EXISTS idx_global_flags_player_name ON global_flags(player_id, flag_name);
CREATE INDEX IF NOT EXISTS idx_dialog_history_player_id ON dialog_history(player_id);
CREATE INDEX IF NOT EXISTS idx_relationship_history_relationship_id ON relationship_history(relationship_id);
"""

print("SQLite Schema for Dialog System:")
print("="*50)
print(sql_schema)