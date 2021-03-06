using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Helpers;
using Apollo.Data;
using Apollo.Models;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Services
{
    public class ArtistService
    {
        private readonly DataContext _context;
        public ArtistService(DataContext context)
        {
            _context = context;
        }

        public ArrayList GetAllArtists()
        {
            var artists = _context.Artist.ToList();
            ArrayList artistsList = new ArrayList();

            foreach (Artist artist in artists)
            {
                artistsList.Add(new
                {
                    id = artist.Id,
                    stageName = artist.StageName
                });
            }

            return artistsList;
        }

        public ArrayList GetMatchingArtists(string str)
        {
            if (String.IsNullOrEmpty(str))
            {
                return new ArrayList();
            }

            var strToLower = str.ToLower();
            var matchingArtists = _context.Artist
                                  .Include(x => x.Biography).
                                  Where(a => a.StageName.ToLower().Contains(strToLower)).ToList();

            ArrayList matchingArtistsList = new ArrayList();

            foreach (Artist artist in matchingArtists)
            {
                var artistBioId = 0;

                if (artist.Biography != null)
                {
                    artistBioId = artist.Biography.Id;
                }

                matchingArtistsList.Add(new
                {
                    id = artist.Id,
                    stageName = artist.StageName,
                    image = artist.Image,
                    firstName = artist.FirstName,
                    lastName = artist.LastName,
                    biograpyId = artistBioId
                });
            }

            return matchingArtistsList;
        }

        public ArrayList FilterArtists(string str)
        {
            if (String.IsNullOrEmpty(str))
            {
                return new ArrayList();
            }

            var strToLower = str.ToLower();

            var matchingArtists = _context.Artist
                .Include(s => s.Albums)
                .Include(s => s.Songs)
                .Include(s => s.Biography)
                .Include(s => s.Labels)
                .Where(s => s.FirstName.ToLower().Contains(strToLower) ||
                            s.LastName.ToLower().Contains(strToLower) ||
                            s.StageName.ToLower().Contains(strToLower) ||
                            s.Age.ToString().ToLower().Contains(strToLower) ||
                            s.Image.ToLower().Contains(strToLower) ||
                            s.Songs.Any(x => x.Title.ToLower().Contains(strToLower)) ||
                            s.Albums.Any(x => x.Title.ToLower().Contains(strToLower)) ||
                            s.Labels.Any(x => x.Name.ToLower().Contains(strToLower)))
                .ToList();

            ArrayList matchingArtistsList = new ArrayList();

            foreach (Artist artist in matchingArtists)
            {
                matchingArtistsList.Add(new
                {
                    id = artist.Id,
                    firstName = artist.FirstName,
                    lastName = artist.LastName,
                    stageName = artist.StageName,
                    age = artist.Age,
                    image = artist.Image,
                    songs = artist.Songs.Select(x => x.Title),
                    albums = artist.Albums.Select(x => x.Title),
                    labels = artist.Labels.Select(x => x.Name)
                });
            }

            return matchingArtistsList;
        }
    }
}
