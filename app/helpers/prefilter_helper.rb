module PrefilterHelper
  def end_year
    Time.now.year.to_s
  end

  def begin_year
    (Time.now.year - 10).to_s
  end
  # This method defines the style and urls for prefilter buttons.
  # Each link can contain an external url or current domain params.
  def prefilter_hash
    {
      :books => {
        'icon' => 'book',
        'label' => 'Books',
        'color' => 'light-teal',
        'links' => [
          { 'label' => 'Any', 'params' => { 'f[resource_type_facet][]' => 'books' } },
          { 'label' => 'New',
            'params' => { 'Author/Creator' => '', 'f[newly_added_facet][]' => 'months_3', 'f[resource_type_facet][]' => 'books',
                          'genre' => '', 'op' => 'AND', 'range[publication_year_range_facet][begin]' => begin_year,
                          'range[publication_year_range_facet][end]' => end_year, 'search_field' => 'advanced', 'sort' => 'publication_sort+desc,+title_sort+asc'
            }
          },
          { 'label' => 'E-books', 'params' => { 'f[access_facet][]' => 'Online', 'f[resource_type_facet][]' => 'books' } },
          { 'label' => 'Print Books', 'params' => { 'f[access_facet][]' => 'At the Library', 'f[resource_type_facet][]' => 'books' } },
          { 'label' => 'Juvenile Books', 'params' => { 'f[resource_type_facet][]' => 'books', 'f[shelf_facet][]' => 'Sycamore Library Juvenile Collection' } },
          { 'label' => 'Reserves', 'url' => 'https://iii.library.unt.edu/search/r' },
        ],
      },
      :journals => {
        'icon' => 'book-alt',
        'label' => 'Journals & Periodicals',
        'color' => 'dark-teal',
        'links' => [
          { 'label' => 'Any', 'params' => { 'f[resource_type_facet][]' => 'journals_periodicals' } },
          { 'label' => 'e-Journals', 'params' => { 'f[access_facet][]' => 'Online', 'f[resource_type_facet][]' => 'journals_periodicals' } },
          { 'label' => 'Print Journals', 'params' => { 'f[access_facet][]' => 'At the Library', 'f[resource_type_facet][]' => 'journals_periodicals' } },
          { 'label' => 'Newspapers', 'params' => { 'f[resource_type_facet][]' => 'newspapers' } },
          { 'label' => 'Search Inside',
            'url' => 'https://untexas.summon.serialssolutions.com/search?q=&fvf=ContentType%2CJournal+Article%2Cf&fvf=IsPeerReviewed%2Ctrue%2Cf&fvf=IsFullText%2Ctrue%2Cf#!/search?ho=t&include.ft.matches=f&fvf=ContentType,Journal%20Article,f%7CIsPeerReviewed,true,f%7CIsFullText,true,f&l=en'
          },
        ],
      },
      :music => {
        'icon' => 'music',
        'label' => 'Music',
        'color' => 'lime-green',
        'links' => [
          { 'label' => 'Any', 'params' => { 'f[collection_facet][]' => 'Music Library'} },
          { 'label' => 'Scores', 'params' => { 'f[resource_type_facet][]' => 'music_scores'} },
          { 'label' => 'Music Recordings', 'params' => { 'f[resource_type_facet][]' => 'music_recordings'} },
          { 'label' => 'Books', 'params' => { 'f[collection_facet][]' => 'Music Library', 'f[resource_type_facet][]' => 'books'} },
          { 'label' => 'Online', 'params' => { 'f[access_facet][]' => 'Online', 'f[collection_facet][]' => 'Music Library'} },
          { 'label' => 'Reference', 'params' => { 'f[shelf_facet][]' => 'Willis 4FL Music Reference', 'f[collection_facet][]' => 'Music Library'} },
        ],
      },
      :film => {
        'icon' => 'film',
        'label' => 'Film & Video',
        'color' => 'light-green',
        'links' => [
          { 'label' => 'Any', 'params' => { 'f[resource_type_facet][]' => 'video_film'} },
          { 'label' => 'New',
            'params' => { 'f[resource_type_facet][]' => 'video_film', 'f[newly_added_facet][]' => 'months_3', 'range[publication_year_range_facet][begin]' => begin_year, 'range[publication_year_range_facet][end]' => end_year, 'sort' => 'publication_sort+desc,+title_sort+asc' } },
          { 'label' => 'DVDs', 'params' => { 'f[media_type_facet][]' => 'DVDs' } },
          { 'label' => 'Blu-ray', 'params' => { 'f[media_type_facet][]' => 'Blu-ray Discs' } },
          { 'label' => 'Online', 'params' => { 'f[access_facet][]' => 'Online', 'f[resource_type_facet][]' => 'video_film' } },
        ],
      },
      :gaming => {
        'icon' => 'gamepad',
        'label' => 'Gaming',
        'color' => 'green',
        'links' => [
          { 'label' => 'Any', 'params' => { 'f[resource_type_facet][]' => 'games' } },
          { 'label' => 'Systems & Peripherals', 'url' => '',
            'params' => { 'f[collection_facet][]' => 'Media Library', 'f[resource_type_facet][]' => 'equipment' } },
          { 'label' => 'Console Games', 'params' => { 'f[media_type_facet][]' => 'Console Games' } },
          { 'label' => 'Handheld', 'params' => { 'f[media_type_facet][]' => 'Handheld Games' } },
          { 'label' => 'Tabletop', 'params' => { 'f[media_type_facet][]' => 'Tabletop Games' } },
        ],
      },
      :makers => {
        'icon' => 'cube',
        'label' => 'Makers',
        'color' => 'aqua',
        'links' => [
          { 'label' => 'Equipment & Tools', 'params' => { 'f[collection_facet][]' => 'The Spark (Makerspace)' } },
          { 'label' => 'A/V Equipment', 'url' => 'https://guides.library.unt.edu/spark/av' },
        ],
      },
      :reference => {
        'icon' => 'database',
        'label' => 'Reference',
        'color' => 'lime',
        'links' => [
          { 'label' => 'Style Manuals', 'params' => { 'f[genre_heading_facet][]' => 'style-manuals' } },
          { 'label' => 'Encyclopedias and Dictionaries', 'params' => { 'f[genre_facet][]' => 'encyclopedias-and-dictionaries!Encyclopedias and dictionaries' } },
          { 'label' => 'Online Databases', 'params' => { 'f[resource_type_facet][]' => 'online_databases' } },
        ],
      },
      :gov_docs => {
        'icon' => 'archive',
        'label' => 'Government Docs',
        'color' => 'forest-green',
        'links' => [
          { 'label' => 'Any', 'params' => { 'f[collection_facet][]' => 'Government Documents' } },
          { 'label' => 'Print Documents', 'params' => { 'f[access_facet][]' => 'At the Library', 'f[collection_facet][]' => 'Government Documents' } },
          { 'label' => 'Online Documents', 'params' => { 'f[access_facet][]' => 'Online', 'f[collection_facet][]' => 'Government Documents' } },
        ],
      },
    }
  end

  def render_prefilter_link(link, button_label = nil)
    url = link['url'] || ''
    params = link['params'] || {}
    label = link['label']
    full_url = url.present? ? url : search_action_url(params)
    puts "**** HEY LOOK HERE ****"
    puts full_url

    link_to full_url, class: "dropdown-item",
            'ga-on': 'click',
            'ga-event-category': 'Pre-filter',
            'ga-event-action': button_label || label,
            'ga-event-label': label,
            'ga-event-value': '0' do
      label
    end
  end
end
