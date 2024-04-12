export interface NamedLink {
    name: string;
    url: string;
}

export interface AbilityDescription {
    ability: NamedLink;
    is_hidden: false;
    slot: number;
}

export interface VersionGroupMethod {
    level_learned_at: number;
    move_learn_method: NamedLink;
    version_group: NamedLink;
}

export interface MoveDescription {
    move: NamedLink;
    version_group_method: VersionGroupMethod[];
}

export interface TypeDescription {
    slot: number;
    type: NamedLink;
}

export interface GameIndice {
    game_index: number;
    version: NamedLink;
}

export interface SpriteList {
    back_default: string|null;
    back_female:null
    back_shiny: string|null;
    back_shiny_female: string|null;
    front_default: string|null;
    front_female: string|null;
    front_shiny: string|null;
    front_shiny_female: string|null;
}

export interface StatDescription {
    base_stat: number;
    effort: number;
    stat: NamedLink;
}

export interface SpriteDescription extends SpriteList {
    other?: any;
    versions?: any;
}

export interface Pokemon {
    abilities: AbilityDescription[];
    base_experience: number;
    forms: NamedLink[];
    game_indices: GameIndice[];
    height: number;
    held_items: NamedLink[];
    id: number;
    is_default: boolean;
    location_area_encounters: string;
    moves: MoveDescription[];
    name: string;
    order: number;
    past_types: TypeDescription[];
    species: NamedLink;
    sprites: SpriteDescription;
    stats: StatDescription[];
    types: TypeDescription[]
}

export interface PokemonPage {
    count: number;
    next: string|null;
    previous: string|null;
    results: NamedLink[];
}
